const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class LevelTop extends Command {
  constructor(client) {
    super(client, {
      name: "leveltop",
      description: client.cmdConfig.leveltop.description,
      usage: client.cmdConfig.leveltop.usage,
      permissions: client.cmdConfig.leveltop.permissions,
      aliases: client.cmdConfig.leveltop.aliases,
      category: "member",
      enabled: client.cmdConfig.leveltop.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    if(this.client.config.plugins.leveling.enabled == false) return;
    let levelTop = (await this.client.database.usersData().all()).filter((u) => u.level || u.value?.level);
    if(levelTop.length == 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    levelTop = levelTop.sort((a, b) => (b.value?.level ?? b.level) - (a.value?.level ?? a.level)).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id) || "N/A")
      .replace("<data>", x.value?.level ?? x.level)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.level));
      
    this.client.paginateContent(this.client, levelTop, 10, 1, message, this.client.language.titles.level_top, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    if(this.client.config.plugins.leveling.enabled == false) return;
    let levelTop = (await this.client.database.usersData().all()).filter((u) => u.level || u.value?.level);
    if(levelTop.length == 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    levelTop = levelTop.sort((a, b) => (b.value?.level ?? b.level) - (a.value?.level ?? a.level)).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id) || "N/A")
      .replace("<data>", x.value?.level ?? x.level)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.level));
      
    this.client.paginateContent(this.client, levelTop, 10, 1, interaction, this.client.language.titles.level_top, this.client.embeds.general_color);
  }
};
