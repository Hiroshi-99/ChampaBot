const Command = require("../../structures/Command");
const Discord = require('discord.js');


module.exports = class GiveawayEdit extends Command {
  constructor(client) {
    super(client, {
      name: "gend",
      description: client.cmdConfig.gend.description,
      usage: client.cmdConfig.gend.usage,
      permissions: client.cmdConfig.gend.permissions,
      aliases: client.cmdConfig.gend.aliases,
      category: "giveaway",
      enabled: client.cmdConfig.gend.enabled,
      slash: true,
      options: [{
        name: 'msgid',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Message ID of Giveaway',
        required: true,
      }],
    });
  }

  async run(message, args) {
    let messageID = args[0];

    if (!messageID || isNaN(messageID)) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    let gwData = await this.client.database.gwData().get(`${messageID}`);
    
    if(!gwData || gwData?.ended == true) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    this.client.gw.endGiveaway(this.client, message, messageID, message.guild);
    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.giveaway, this.client.language.giveaway.ended, this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    let messageID = interaction.options.getString("msgid");

    let gwData = await this.client.database.gwData().get(messageID);
    
    if(!gwData || gwData?.ended == true) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    this.client.gw.endGiveaway(this.client, interaction, messageID, interaction.guild);
    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.giveaway, this.client.language.giveaway.ended, this.client.embeds.success_color)] });
  }
};
