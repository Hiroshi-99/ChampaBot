const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      description: client.cmdConfig.balance.description,
      usage: client.cmdConfig.balance.usage,
      permissions: client.cmdConfig.balance.permissions,
      aliases: client.cmdConfig.balance.aliases,
      category: "economy",
      enabled: client.cmdConfig.balance.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User whose Balance to view",
        type: Discord.ApplicationCommandOptionType.User,
        required: false,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let user = message.mentions.users.first() || message.author;
    const userData = await this.client.database.usersData().get(user.id) || {};

    let money = userData.money || 0;
    let bank = userData.bank || 0;
    let total = Number(money + bank);
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.balance.replace("<user>", user.username).replace("<balance>", money).replace("<bank>", bank).replace("<total>", total), this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let user = interaction.options.getUser("user") || interaction.user;
    const userData = await this.client.database.usersData().get(user.id) || {};

    let money = userData.money || 0;
    let bank = userData.bank || 0;
    let total = Number(money + bank);
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.balance.replace("<user>", user.username).replace("<balance>", money).replace("<bank>", bank).replace("<total>", total), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.balance.ephemeral });
  }
};
