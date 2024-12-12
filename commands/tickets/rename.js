const Command = require("../../structures/Command");

const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class Rename extends Command {
	constructor(client) {
		super(client, {
			name: "rename",
			description: client.cmdConfig.rename.description,
			usage: client.cmdConfig.rename.usage,
			permissions: client.cmdConfig.rename.permissions,
      aliases: client.cmdConfig.rename.aliases,
			category: "tickets",
			enabled: client.cmdConfig.rename.enabled,
      slash: true,
      options: [{
        name: 'name',
        type: ApplicationCommandOptionType.String,
        description: "New name of ticket channel. Placeholders: <username>, <ticket>",
        required: true,
      }]
		});
	}
  
  async run(message, args) {
    let name = args[0];

    const ticketData = await this.client.database.ticketsData().get(message.channel.id);
    if (!ticketData) 
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.ticket_channel, this.client.embeds.error_color)] });
    
    if(!name) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.rename.usage)] });
    
    message.channel.setName(this.client.utils.ticketPlaceholders(name, this.client.users.cache.get(ticketData.owner), ticketData.ticketId));
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.renamed.replace("<channel>", message.channel).replace("<name>", name).replace("<ticket>"), this.client.embeds.error_color)] });
  }
  async slashRun(interaction, args) {
    let name = interaction.options.getString("name");

    const ticketData = await this.client.database.ticketsData().get(interaction.channel.id);
    if (!ticketData) 
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.ticket_channel, this.client.embeds.error_color)] });
    
    message.channel.setName(this.client.utils.ticketPlaceholders(name, this.client.users.cache.get(ticketData.owner), ticketData.ticketId));
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.renamed.replace("<channel>", message.channel).replace("<name>", name).replace("<ticket>"), this.client.embeds.error_color)] });
  }
};