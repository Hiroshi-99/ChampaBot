const Command = require("../../structures/Command");
const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = class Dog extends Command {
  constructor(client) {
    super(client, {
      name: "dog",
      description: client.cmdConfig.dog.description,
      usage: client.cmdConfig.dog.usage,
      permissions: client.cmdConfig.dog.permissions,
      usage: client.cmdConfig.dog.usage,
      category: "fun",
      enabled: client.cmdConfig.dog.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    const dog = await fetch("https://random.dog/woof.json").then(async(res) => await res.json());

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setImage(dog.url);

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    await interaction.deferReply({ ephemeral: this.client.cmdConfig.dog.ephemeral });
    const dog = await fetch("https://random.dog/woof.json").then(async(res) => await res.json());

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setImage(dog.url);

    interaction.followUp({ embeds: [embed] });
  }
};
