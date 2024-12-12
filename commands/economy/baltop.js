const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class BalTop extends Command {
  constructor(client) {
    super(client, {
      name: "baltop",
      description: client.cmdConfig.baltop.description,
      usage: client.cmdConfig.baltop.usage,
      permissions: client.cmdConfig.baltop.permissions,
      aliases: client.cmdConfig.baltop.aliases,
      category: "economy",
      enabled: client.cmdConfig.baltop.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let balTop = (await this.client.database.usersData().all())
      .filter((u) => u.money >= 0 || u.value?.money > 0);
    if(balTop.length == 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    balTop = await Promise.all(balTop.sort((a, b) => (b.value?.money ?? b.money) - (a.value?.money ?? a.money)).map(async(x, i) => {
      let bank = await this.client.database.usersData().get(`${x.id}.bank`) || 0;
      return this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
        .replace("<user>", this.client.users.cache.get(x.id) || "N/A")
        .replace("<symbol>", this.client.config.general.currency_symbol)
        .replace("<data>", Number(bank + (x.value?.money ?? x.money)))
    }))

    this.client.paginateContent(this.client, balTop, 10, 1, message, this.client.language.titles.balance_top, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    let balTop = (await this.client.database.usersData().all())
      .filter((u) => u.money >= 0 || u.value?.money > 0);
    if(balTop.length == 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    balTop = await Promise.all(balTop.sort((a, b) => (b.value?.money ?? b.money) - (a.value?.money ?? a.money)).map(async(x, i) => {
      let bank = await this.client.database.usersData().get(`${x.id}.bank`) || 0;
      return this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
        .replace("<user>", this.client.users.cache.get(x.id) || "N/A")
        .replace("<symbol>", this.client.config.general.currency_symbol)
        .replace("<data>", Number(bank + (x.value?.money ?? x.money)))
    }));
      
    this.client.paginateContent(this.client, balTop, 10, 1, interaction, this.client.language.titles.balance_top, this.client.embeds.general_color);
  }
};
