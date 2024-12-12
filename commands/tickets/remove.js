const Command = require("../../structures/Command");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");


module.exports = class Remove extends Command {
	constructor(client) {
		super(client, {
			name: "remove",
			description: client.cmdConfig.remove.description,
			usage: client.cmdConfig.remove.usage,
			permissions: client.cmdConfig.remove.permissions,
      aliases: client.cmdConfig.remove.aliases,
			category: "tickets",
			enabled: client.cmdConfig.remove.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: "User to remove from Ticket",
        required: true,
      }]
		});
	}

  async run(message, args) {
    let config = this.client.config;

    const ticketData = await this.client.database.ticketsData().get(message.channel.id);
    if (!ticketData) 
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.ticket_channel, this.client.embeds.error_color)] });
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);;

    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.remove.usage)] });
    
    message.guild.channels.cache.get(message.channel.id).permissionOverwrites.create(member.id, { ViewChannel: false, SendMessages: false });
    
    const removed = new EmbedBuilder()
      .setTitle(this.client.embeds.title)
      .setDescription(this.client.language.tickets.user_removed.replace("<user>", member.user.username))
      .setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor(this.client.embeds.success_color);
    
    message.channel.send({ embeds: [removed] });
  }
  async slashRun(interaction, args) {
    let config = this.client.config;
    let member = interaction.options.getUser("user");

    const ticketData = await this.client.database.ticketsData().get(interaction.channel.id);
    if (!ticketData)
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.ticket_channel, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.remove.ephemeral });
    
    interaction.guild.channels.cache.get(interaction.channel.id).permissionOverwrites.create(member.id, { ViewChannel: false, SendMessages: false });
    
    const removed = new EmbedBuilder()
      .setTitle(this.client.embeds.title)
      .setDescription(this.client.language.tickets.user_removed.replace("<user>", member.user.username))
      .setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor(this.client.embeds.success_color);
    
    interaction.reply({ embeds: [removed], ephemeral: this.client.cmdConfig.remove.ephemeral });
  }
};