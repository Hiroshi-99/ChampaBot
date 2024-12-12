const Command = require("../../structures/Command");
const { PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, ApplicationCommandOptionType } = require("discord.js");


module.exports = class New extends Command {
	constructor(client) {
		super(client, {
			name: "new",
			description: client.cmdConfig.new.description,
			usage: client.cmdConfig.new.usage,
			permissions: client.cmdConfig.new.permissions,
      aliases: client.cmdConfig.new.aliases,
			category: "tickets",
			enabled: client.cmdConfig.new.enabled,
      slash: true,
      options: [{
        name: "reason",
        type: ApplicationCommandOptionType.String,
        description: "Reason for Ticket",
        required: false
      }]
		});
	}
  
  async run(message, args) {
    let config = this.client.config;
    let plugin = config.plugins.tickets;
    let reason = args.slice(1).join(" ");

    if(config.channels.category_id == "") 
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.no_category, this.client.embeds.error_color)] });
  
    let tickets = await this.client.database.usersData().get(`${message.author.id}.tickets`) || [];
    let ticketId = parseInt(await this.client.database.guildData().get(`${message.guild.id}.ticketCount`) || 0) + 1;
    if(tickets.length == plugin.limit)
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.limit.replace("<user>", message.author).replace("<limit>", plugin.limit), this.client.embeds.error_color)] });

    const supportRoles = config.roles.support.map((r) => ({
      id: this.client.utils.findRole(message.guild, r),
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
    })) || [];
    
    const ticketParent = this.client.utils.findChannel(message.guild, config.channels.ticket_category);
    await message.guild.channels.create({
      name: this.client.utils.ticketPlaceholders(plugin.channel_name, message.author, ticketId),
      parent: ticketParent.id,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: this.client.user,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
        }, 
        {
          id: message.member.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: message.guild.id,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        ...supportRoles
      ]
    }).then(async(c) => {
      const gotoBttn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL(`https://discord.com/channels/${message.guild.id}/${c.id}`)
          .setLabel(this.client.language.buttons.tickets.go_ticket)
          .setStyle(ButtonStyle.Link)
      );

      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.new.replace("<user>", message.author).replace("<channel>", c), this.client.embeds.success_color)], components: [gotoBttn] });
      await this.client.database.usersData().push(`${message.author.id}.tickets`, {
        channel: c.id,
        reason,
        id: ticketId
      });
      await this.client.database.ticketsData().set(`${c.id}`, {
        date: new Date(),
        owner: message.author.id,
        ticketId: ticketId
      });
      await this.client.database.guildData().add(`${message.guild.id}.ticketCount`, 1);

      if(this.client.config.roles.support.length > 0 && plugin.mention_support == true)
        c.send({ content: `${this.client.config.roles.support.map((r) => this.client.utils.findRole(message.guild, r)).join(", ").trim()}` }).then((m) => setTimeout(async() => await m.delete().catch((err) => { }), 5000));
      if(plugin.mention_author == true)
        c.send({ content: `${message.author}` }).then((m) => setTimeout(async() => await m.delete().catch((err) => { }), 5000));

      const closeBttn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setStyle(ButtonStyle.Danger)
          .setLabel(this.client.language.buttons.tickets.close_ticket)
          .setEmoji(config.emojis.tickets.close_ticket || {})
      );

      const embed = new EmbedBuilder()
        .setTitle(this.client.embeds.ticket.title)
        .setDescription(this.client.embeds.ticket.description.replace("<user>", message.author)
          .replace("<reason>", reason))
        .setColor(this.client.embeds.ticket.color)

      if(this.client.embeds.ticket.footer == true) embed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
      if(this.client.embeds.ticket.thumbnail) embed.setThumbnail(this.client.embeds.ticket.thumbnail);

      await c.send({ embeds: [embed], components: [closeBttn] });
    });
  }
  async slashRun(interaction, args) {
    let config = this.client.config;
    let plugin = config.plugins.tickets;
    let reason = interaction.options?.getString("reason") || "N/A";

    if(config.channels.category_id == "") 
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.no_category, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.new.ephemeral });

    let tickets = await this.client.database.usersData().get(`${interaction.user.id}.tickets`) || [];
    let ticketId = parseInt(await this.client.database.guildData().get(`${interaction.guild.id}.ticketCount`) || 0) + 1;
    if(tickets.length == plugin.limit) {
      if(interaction.type = InteractionType.ApplicationCommand)
        return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.limit.replace("<user>", interaction.user).replace("<limit>", plugin.limit), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.new.ephemeral });
      else return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.limit.replace("<user>", interaction.user).replace("<limit>", plugin.limit), this.client.embeds.error_color)], ephemeral: true });
    }

    const supportRoles = config.roles.support.map((r) => ({
      id: this.client.utils.findRole(interaction.guild, r),
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
    })) || [];
    
    const ticketParent = this.client.utils.findChannel(interaction.guild, config.channels.ticket_category);
    await interaction.guild.channels.create({
      name: this.client.utils.ticketPlaceholders(plugin.channel_name, interaction.user, ticketId),
      parent: ticketParent.id,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: this.client.user,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
        }, 
        {
          id: interaction.member.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        ...supportRoles
      ]
    }).then(async(c) => {
      const gotoBttn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL(`https://discord.com/channels/${interaction.guild.id}/${c.id}`)
          .setLabel(this.client.language.buttons.tickets.go_ticket)
          .setStyle(ButtonStyle.Link)
      );

      if(interaction.type == InteractionType.ApplicationCommand) {
        await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, 
          this.client.language.tickets.new.replace("<user>", interaction.user).replace("<channel>", c), this.client.embeds.success_color)], components: [gotoBttn], ephemeral: this.client.cmdConfig.new.ephemeral });
      } else if(interaction.type == InteractionType.MessageComponent) {
        await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, 
          this.client.language.tickets.new.replace("<user>", interaction.user).replace("<channel>", c), this.client.embeds.success_color)], components: [gotoBttn], ephemeral: true });
      }
      
      await this.client.database.usersData().push(`${interaction.user.id}.tickets`, {
        channel: c.id,
        reason,
        id: ticketId
      });
      await this.client.database.ticketsData().set(c.id, {
        date: new Date(),
        owner: interaction.user.id,
        ticketId: ticketId
      });
      await this.client.database.guildData().add(`${interaction.guild.id}.ticketCount`, 1);

      if(this.client.config.roles.support.length > 0 && plugin.mention_support == true)
        c.send({ content: `${this.client.config.roles.support.map((r) => this.client.utils.findRole(interaction.guild, r)).join(", ").trim()}` }).then((m) => setTimeout(async() => await m.delete().catch((err) => { }), 5000));
      if(plugin.mention_author == true)
        c.send({ content: `${interaction.user}` }).then((m) => setTimeout(async() => await m.delete().catch((err) => { }), 5000));

      const closeBttn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setStyle(ButtonStyle.Danger)
          .setLabel(this.client.language.buttons.tickets.close_ticket)
          .setEmoji(config.emojis.tickets.close_ticket || {})
      );

      const embed = new EmbedBuilder()
        .setTitle(this.client.embeds.ticket.title)
        .setDescription(this.client.embeds.ticket.description.replace("<user>", interaction.user)
          .replace("<reason>", reason))
        .setColor(this.client.embeds.ticket.color)

      if(this.client.embeds.ticket.footer == true) embed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
      if(this.client.embeds.ticket.thumbnail) embed.setThumbnail(this.client.embeds.ticket.thumbnail);

      await c.send({ embeds: [embed], components: [closeBttn] });
    });
  }
};