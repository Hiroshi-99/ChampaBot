const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = class Pause extends Command {
	constructor(client) {
		super(client, {
			name: "pause",
			description: client.cmdConfig.pause.description,
			usage: client.cmdConfig.pause.usage,
			permissions: client.cmdConfig.pause.permissions,
      aliases: client.cmdConfig.pause.aliases,
			category: "music",
			enabled: client.cmdConfig.pause.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (!queue.node.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.already_paused, this.client.embeds.error_color)] });

    queue.node.setPaused(true);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.paused, this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pause.ephemeral });

    if (!queue.node.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.already_paused, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pause.ephemeral });

    queue.node.setPaused(true);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.paused, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.pause.ephemeral });
  }
};