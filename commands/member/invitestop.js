const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class InvitesTop extends Command {
  constructor(client) {
    super(client, {
      name: "invitestop",
      description: client.cmdConfig.invitestop.description,
      usage: client.cmdConfig.invitestop.usage,
      permissions: client.cmdConfig.invitestop.permissions,
      aliases: client.cmdConfig.invitestop.aliases,
      category: "member",
      enabled: client.cmdConfig.invitestop.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let invitesTop = (await this.client.database.usersData().all())
      .filter((u) => u.value?.invites?.regular >= 0 || u.invites?.regular >= 0);
    if(invitesTop.length == 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    invitesTop = invitesTop.sort((a, b) => (b.value?.invites?.regular ?? b.invites?.regular) - (a.value?.invites?.regular ?? a.invites?.regular)).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id) || "N/A")
      .replace("<data>", x.value?.invites?.regular ?? x.invites?.regular)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.invites));
      
    this.client.paginateContent(this.client, invitesTop, 10, 1, message, this.client.language.titles.invites_top, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    let invitesTop = (await this.client.database.usersData().all())
      .filter((u) => u.value?.invites?.regular >= 0 || u.invites?.regular >= 0);
    if(invitesTop.length == 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    invitesTop = invitesTop.sort((a, b) => (b.value?.invites?.regular ?? b.invites?.regular) - (a.value?.invites?.regular ?? a.invites?.regular)).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id) || "N/A")
      .replace("<data>", x.value?.invites?.regular ?? x.invites?.regular)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.invites));
      
    this.client.paginateContent(this.client, invitesTop, 10, 1, interaction, this.client.language.titles.invites_top, this.client.embeds.general_color);
  }
};
