const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "deposit",
      description: client.cmdConfig.deposit.description,
      usage: client.cmdConfig.deposit.usage,
      permissions: client.cmdConfig.deposit.permissions,
      aliases: client.cmdConfig.deposit.aliases,
      category: "economy",
      enabled: client.cmdConfig.deposit.enabled,
      slash: true,
      options: [{
        name: "amount",
        description: "Amount to deposit into bank",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let amount = args[0];

    const userData = await this.client.database.usersData().get(message.author.id) || {};
    let balance = userData.money;

    if(!amount || (isNaN(amount) && amount != "all")) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.deposit.usage)] });

    if(amount == "all") amount = parseInt(balance);
    else amount = parseInt(amount);

    if(isNaN(amount) || amount < 1 || amount > balance || `${amount}`.includes("-")) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });

    await this.client.database.usersData().add(`${message.author.id}.bank`, parseInt(amount));
    await this.client.database.usersData().sub(`${message.author.id}.money`, parseInt(amount));
    let bank = userData.bank += parseInt(amount);

    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.bank.deposited.replace("<bank>", bank).replace("<amount>", parseInt(amount)), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let amount = interaction.options.getString("amount");

    const userData = await this.client.database.usersData().get(interaction.user.id) || {};
    let balance = userData.money;

    if((isNaN(amount) && amount != "all")) return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, interaction, this.client.cmdConfig.deposit.usage)] });

    if(amount == "all") amount = parseInt(balance);
    else amount = parseInt(amount);

    if(isNaN(amount) || amount < 1 || amount > balance || `${amount}`.includes("-")) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.deposit.ephemeral });
    
    await this.client.database.usersData().add(`${interaction.user.id}.bank`, parseInt(amount));
    await this.client.database.usersData().sub(`${interaction.user.id}.money`, parseInt(amount));
    let bank = userData.bank += parseInt(amount);
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.bank.deposited.replace("<bank>", bank).replace("<amount>", parseInt(amount)), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.deposit.ephemeral });
  }
};
