const Command = require("../../structures/Command");
const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = class DankMeme extends Command {
  constructor(client) {
    super(client, {
      name: "dankmeme",
      description: client.cmdConfig.dankmeme.description,
      usage: client.cmdConfig.dankmeme.usage,
      permissions: client.cmdConfig.dankmeme.permissions,
      usage: client.cmdConfig.dankmeme.usage,
      category: "fun",
      enabled: client.cmdConfig.dankmeme.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    const dankMeme = await fetch("https://www.reddit.com/user/emdix/m/dankmemes/top/.json?sort=top&t=day&limit=300").then(async(res) => await res.json());

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setImage(dankMeme.data.children[Math.floor(Math.random() * dankMeme.data.children.length)].data.url_overridden_by_dest);

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    await interaction.deferReply({ ephemeral: this.client.cmdConfig.dankmeme.ephemeral });

    const dankMeme = await fetch("https://www.reddit.com/user/emdix/m/dankmemes/top/.json?sort=top&t=day&limit=300").then(async(res) => await res.json());

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setImage(dankMeme.data.children[Math.floor(Math.random() * dankMeme.data.children.length)].data.url_overridden_by_dest);

    interaction.followUp({ embeds: [embed] });
  }
};
