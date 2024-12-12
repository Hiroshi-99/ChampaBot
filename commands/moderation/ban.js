const Command = require("../../structures/Command");

const Discord = require("discord.js")

module.exports = class Ban extends Command {
	constructor(client) {
		super(client, {
			name: "ban",
			description: client.cmdConfig.ban.description,
			usage: client.cmdConfig.ban.usage,
			permissions: client.cmdConfig.ban.permissions,
			aliases: client.cmdConfig.ban.aliases,
			category: "moderation",
			enabled: client.cmdConfig.ban.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Ban',
        required: true,
      }, {
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Ban Reason',
        required: false,
      }]
		});
	}

  async run(message, args) {
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.ban.usage)] });

    const botRole = message.guild.members.cache.get(this.client.user.id).roles.highest;
    if (member.permissions.has("BanMembers") && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)] });
  
    if (message.author.id == member.id)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
  
    if (!member.bannable || 
      member.roles.highest.position > botRole.position || member.permissions.has("Administrator"))
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });
    let reason = args.slice(1).join(" ");
    if (!reason) reason = this.client.language.moderation.no_reason;
  
    let dmEmbed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.punishments.banned_dm.color);
    if(this.client.embeds.punishments.banned_dm.title) dmEmbed.setTitle(this.client.embeds.punishments.banned_dm.title);
    
    if(this.client.embeds.punishments.banned_dm.description) dmEmbed.setDescription(this.client.embeds.punishments.banned_dm.description.replace("<staff>", message.author.username)
      .replace("<reason>", reason)
      .replace("<guild>", message.guild.name)
      .replace("<user>", member.user.username));
    
    let field = this.client.embeds.punishments.banned_dm.fields;
    for(let i = 0; i < this.client.embeds.punishments.banned_dm.fields.length; i++) {
    dmEmbed.addFields([{ name: field[i].title, value: field[i].description.replace("<staff>", message.author.username)
      .replace("<reason>", reason)
      .replace("<guild>", message.guild.name)
      .replace("<user>", member.user.username) }]);
    }
    
    if(this.client.embeds.punishments.banned_dm.footer == true) dmEmbed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
    if(this.client.embeds.punishments.banned_dm.thumbnail == true) dmEmbed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

    if(this.client.config.general.dm_punishment == true)
      await member.send({ embeds: [dmEmbed] }).catch((err) => { });
    
    message.guild.members.ban(member, { reason: reason });
  
    let banEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.ban, this.client.language.moderation.banned.replace("<user>", member.user.username)
      .replace("<staff>", message.author.username)
      .replace("<reason>", reason), this.client.embeds.success_color);
  
    message.channel.send({ embeds: [banEmbed] });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.banned)
      .replace("<staff>", message.author.username));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.ban, [{
      name: this.client.language.titles.logs.fields.user,
      desc: `${member.user.username}`
    }, {
      name: this.client.language.titles.logs.fields.staff,
      desc: `${message.author.username}`
    }, {
      name: this.client.language.titles.logs.fields.reason,
      desc: reason
    }, {
      name: this.client.language.titles.logs.fields.duration,
      desc: "Permanent"
    }], member.user, "BAN");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: message.author.id,
      author: message.author.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      duration: "Permanent",
      message: `user_banned`
    });
  }

  async slashRun(interaction, args) {
    let member = interaction.options.getMember("user");

    const botRole = interaction.guild.members.cache.get(this.client.user.id).roles.highest;
    if (member.permissions.has("BanMembers") && !interaction.member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.ban.ephemeral });

    if (interaction.user.id == member.id)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.ban.ephemeral });

    if (!member.bannable || 
      member.roles.highest.position > botRole.position || member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.ban.ephemeral });
    let reason = interaction.options.getString("reason");
    if (!reason) reason = this.client.language.moderation.no_reason;
  
    let dmEmbed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.punishments.banned_dm.color);
    if(this.client.embeds.punishments.banned_dm.title) dmEmbed.setTitle(this.client.embeds.punishments.banned_dm.title);
    
    if(this.client.embeds.punishments.banned_dm.description) dmEmbed.setDescription(this.client.embeds.punishments.banned_dm.description.replace("<staff>", interaction.user.username)
      .replace("<reason>", reason)
      .replace("<guild>", interaction.guild.name)
      .replace("<user>", member.user.username));
    
    let field = this.client.embeds.punishments.banned_dm.fields;
    for(let i = 0; i < this.client.embeds.punishments.banned_dm.fields.length; i++) {
    dmEmbed.addFields([{ name: field[i].title, value: field[i].description.replace("<staff>", interaction.user.username)
      .replace("<reason>", reason)
      .replace("<guild>", interaction.guild.name)
      .replace("<user>", member.user.username) }]);
    }
    
    if(this.client.embeds.punishments.banned_dm.footer == true) dmEmbed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
    if(this.client.embeds.punishments.banned_dm.thumbnail == true) dmEmbed.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    if(this.client.config.general.dm_punishment == true)
      await member.send({ embeds: [dmEmbed] }).catch((err) => { });

    interaction.guild.members.ban(member, { reason: reason });
  
    let banEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.ban, this.client.language.moderation.banned.replace("<user>", member.user.username)
      .replace("<staff>", interaction.user.username)
      .replace("<reason>", reason), this.client.embeds.success_color);

    interaction.reply({ embeds: [banEmbed], ephemeral: this.client.cmdConfig.ban.ephemeral });
  
    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.banned)
      .replace("<staff>", interaction.user.username));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.ban, [{
      name: this.client.language.titles.logs.fields.user,
      desc: `${member.user.username}`
    }, {
      name: this.client.language.titles.logs.fields.staff,
      desc: `${interaction.user.username}`
    }, {
      name: this.client.language.titles.logs.fields.reason,
      desc: reason
    }, {
      name: this.client.language.titles.logs.fields.duration,
      desc: "Permanent"
    }], member.user, "BAN");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: interaction.user.id,
      author: interaction.user.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      duration: "Permanent",
      message: `user_banned`
    });
  }
};
