const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "withdraw",
      description: client.cmdConfig.withdraw.description,
      usage: client.cmdConfig.withdraw.usage,
      permissions: client.cmdConfig.withdraw.permissions,
      aliases: client.cmdConfig.withdraw.aliases,
      category: "economy",
      enabled: client.cmdConfig.withdraw.enabled,
      slash: true,
      options: [{
        name: "amount",
        description: "Amount to withdraw from bank",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let amount = args[0];

    let bank = await this.client.database.usersData().get(`${message.author.id}.bank`);
    if(!amount || (isNaN(amount) && amount != "all")) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.withdraw.usage)] });

    if(amount == "all") amount = parseInt(bank);
    else amount = parseInt(amount);

    if(isNaN(amount) || amount < 1 || amount > bank || `${amount}`.includes("-")) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });

    await this.client.database.usersData().add(`${message.author.id}.money`, parseInt(amount));
    await this.client.database.usersData().sub(`${message.author.id}.bank`, parseInt(amount));

    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.bank.withdrawed.replace("<bank>", parseInt(bank - amount)).replace("<amount>", amount), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let amount = interaction.options.getString("amount");

    let bank = await this.client.database.usersData().get(`${interaction.user.id}.bank`);

    if((isNaN(amount) && amount != "all")) return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, interaction, this.client.cmdConfig.withdraw.usage)] });

    if(amount == "all") amount = parseInt(bank);
    else amount = parseInt(amount);

    if(isNaN(amount) || amount < 1 || amount > bank || `${amount}`.includes("-")) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.withdraw.ephemeral });
    
    await this.client.database.usersData().add(`${interaction.user.id}.money`, parseInt(amount));
    await this.client.database.usersData().sub(`${interaction.user.id}.bank`, parseInt(amount));
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.bank.withdrawed.replace("<bank>", parseInt(bank - amount)).replace("<amount>", amount), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.withdraw.ephemeral });
  }
};
