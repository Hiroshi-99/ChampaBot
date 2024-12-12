const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Bet extends Command {
  constructor(client) {
    super(client, {
      name: "bet",
      description: client.cmdConfig.bet.description,
      usage: client.cmdConfig.bet.usage,
      permissions: client.cmdConfig.bet.permissions,
      aliases: client.cmdConfig.bet.aliases,
      category: "economy",
      enabled: client.cmdConfig.bet.enabled,
      slash: true,
      options: [{
        name: "amount",
        description: "Amount of Money you want to bet",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let userData = await this.client.database.usersData().get(message.author.id) || {};
    let cooldown = userData.cooldowns?.bet || null;
    let timeout = this.client.config.plugins.economy.bet.cooldown * 1000;

    if(cooldown != null && timeout - (Date.now() - cooldown) > 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.bet.cooldown, this.client.embeds.error_color)] });
  
    let money = args[0];
    if(!money || (isNaN(money) && money != "all")) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });

    let balance = userData.money;
          
    if(money == "all") money = parseInt(balance);
    else money = parseInt(money);
    
    if(money > balance || args[0].includes("-")) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });
    if(money < 100) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.bet.less, this.client.embeds.error_color)] });

    let chance = Math.floor(Math.random() * 100) + 1;

    if (chance > 70) {
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.bet.won.replace("<amount>", money), this.client.embeds.success_color)] });
      await this.client.database.usersData().add(`${message.author.id}.money`, money);
    } else if(chance < 70) {
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.bet.lost.replace("<amount>", money), this.client.embeds.error_color)] });
      await this.client.database.usersData().sub(`${message.author.id}.money`, money);
    }

    await this.client.database.usersData().set(`${message.author.id}.cooldowns.bet`, Date.now());
  }

  async slashRun(interaction, args) {
    let userData = await this.client.database.usersData().get(interaction.user.id) || {};
    let cooldown = userData.cooldowns?.bet || null;
    let timeout = this.client.config.plugins.economy.bet.cooldown * 1000;

    if(cooldown != null && timeout - (Date.now() - cooldown) > 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.bet.cooldown, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
  
    let money = interaction.options.getString("amount");
    if(!money || (isNaN(money) && money != "all")) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
    
    let balance = userData.money;

    if(money == "all") money = parseInt(balance);
    else money = parseInt(money);
    
    if(money > balance || args[0].includes("-")) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
    if(money < 100) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.bet.less, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });

    let chance = Math.floor(Math.random() * 100) + 1;

    if (chance > 70) {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.bet.won.replace("<amount>", money), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
      await this.client.database.usersData().add(`${interaction.user.id}.money`, money);
    } else if(chance < 70) {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.bet.lost.replace("<amount>", money), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
      await this.client.database.usersData().sub(`${interaction.user.id}.money`, money);
    }

    await this.client.database.usersData().set(`${interaction.user.id}.cooldowns.bet`, Date.now());
  }
};
