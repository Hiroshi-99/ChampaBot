const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Rob extends Command {
  constructor(client) {
    super(client, {
      name: "rob",
      description: client.cmdConfig.rob.description,
      usage: client.cmdConfig.rob.usage,
      permissions: client.cmdConfig.rob.permissions,
      aliases: client.cmdConfig.rob.aliases,
      category: "economy",
      enabled: client.cmdConfig.rob.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User which to try to rob",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    const user = message.mentions.users.first() || this.client.users.cache.get(args[0]);

    if(!user) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.rob.usage)] });

    if(user.id == message.author.id) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });

    const authorMoney = await this.client.database.usersData().get(`${message.author.id}.money`);
    const userMoney = await this.client.database.usersData().get(`${user.id}.money`);

    if(authorMoney < config.plugins.economy.min_rob || userMoney < config.plugins.economy.min_rob)
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.rob_no_money.replace("<minimum>", config.plugins.economy.min_rob), this.client.embeds.error_color)] });

    const fineAmount = Math.floor(Math.random() * ((authorMoney / 2) - config.plugins.economy.min_rob + 1) + config.plugins.economy.min_rob);
    const robAmount = Math.floor(Math.random() * ((userMoney / 3) - config.plugins.economy.min_rob + 1) + config.plugins.economy.min_rob);

    const robChance = Math.floor(Math.random() * 8);

    if(robChance % 2 == 0) {
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.rob_fail.replace("<amount>", fineAmount).replace("<user>", user.username), this.client.embeds.error_color)] });
      await this.client.database.usersData().sub(`${message.author.id}.money`, Number(fineAmount));
    } else {
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.rob_success.replace("<amount>", robAmount).replace("<user>", user.username), this.client.embeds.success_color)] });
      await this.client.database.usersData().add(`${message.author.id}.money`, Number(robAmount));
      await this.client.database.usersData().sub(`${user.id}.money`, Number(robAmount));
    }
  }

  async slashRun(interaction, args) {
    const config = this.client.config;
    const user = interaction.options.getUser("user");

    const authorMoney = await this.client.database.usersData().get(`${interaction.user.id}.money`);
    const userMoney = await this.client.database.usersData().get(`${user.id}.money`);

    if(user.id == interaction.user.id) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });

    if(authorMoney < config.plugins.economy.min_rob || userMoney < config.plugins.economy.min_rob)
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.rob_no_money.replace("<minimum>", config.plugins.economy.min_rob), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.rob.ephemeral });

    const fineAmount = Math.floor(Math.random() * ((authorMoney / 2) - config.plugins.economy.min_rob + 1) + config.plugins.economy.min_rob);
    const robAmount = Math.floor(Math.random() * ((userMoney / 3) - config.plugins.economy.min_rob + 1) + config.plugins.economy.min_rob);

    const robChance = Math.floor(Math.random() * 8);

    if(robChance % 2 == 0) {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.rob_fail.replace("<amount>", fineAmount).replace("<user>", user.username), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.rob.ephemeral });
      await this.client.database.usersData().sub(`${interaction.user.id}.money`, Number(fineAmount));
    } else {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.rob_success.replace("<amount>", robAmount).replace("<user>", user.username), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.rob.ephemeral });
      await this.client.database.usersData().add(`${interaction.user.id}.money`, Number(robAmount));
      await this.client.database.usersData().sub(`${user.id}.money`, Number(robAmount));
    }
  }
};
