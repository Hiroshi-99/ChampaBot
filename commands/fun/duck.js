const Command = require("../../structures/Command");
const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = class Duck extends Command {
  constructor(client) {
    super(client, {
      name: "duck",
      description: client.cmdConfig.duck.description,
      usage: client.cmdConfig.duck.usage,
      permissions: client.cmdConfig.duck.permissions,
      usage: client.cmdConfig.duck.usage,
      category: "fun",
      enabled: client.cmdConfig.duck.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    const duck = await fetch("https://random-d.uk/api/random").then(async(res) => await res.json());

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setImage(duck.url);

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    await interaction.deferReply({ ephemeral: this.client.cmdConfig.duck.ephemeral });
    const duck = await fetch("https://random-d.uk/api/random").then(async(res) => await res.json());

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setImage(duck.url);

    interaction.followUp({ embeds: [embed] });
  }
};
