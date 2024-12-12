const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "pay",
      description: client.cmdConfig.pay.description,
      usage: client.cmdConfig.pay.usage,
      permissions: client.cmdConfig.pay.permissions,
      aliases: client.cmdConfig.pay.aliases,
      category: "economy",
      enabled: client.cmdConfig.pay.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User to which to send money.",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "amount",
        description: "Amount to send",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let user = message.mentions.users.first() || this.client.users.cache.get(args[0]);
    let amount = args[1];
    let balance = await this.client.database.usersData().get(`${message.author.id}.money`);

    if(!user || !amount) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.pay.usage)] });
    if(isNaN(amount) || amount < 1 || amount > balance || `${amount}`.includes("-")) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });
    if(user.id == message.author.id) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
    if(user.bot) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_bot, this.client.embeds.error_color)] });
    if(balance < amount) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.no_enough, this.client.embeds.error_color)] });

    await this.client.database.usersData().add(`${user.id}.money`, parseInt(amount));
    await this.client.database.usersData().sub(`${message.author.id}.money`, parseInt(amount));
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.paid.replace("<user>", user.username).replace("<amount>", parseInt(amount)), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let user = interaction.options.getUser("user") || interaction.user;
    let amount = interaction.options.getNumber("amount");

    let balance = await this.client.database.usersData().get(`${interaction.user.id}.money`);
    
    if(!user || !amount) return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.pay.usage)] });
    if(isNaN(amount) || amount < 1 || amount > balance || `${amount}`.includes("-")) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
    if(user.id == interaction.user.id) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
    if(user.bot) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_bot, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
    if(balance < amount) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.no_enough, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
    
    await this.client.database.usersData().add(`${user.id}.money`, parseInt(amount));
    await this.client.database.usersData().sub(`${interaction.user.id}.money`, parseInt(amount));
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.paid.replace("<user>", user.username).replace("<amount>", parseInt(amount)), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
  }
};
