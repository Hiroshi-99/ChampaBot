const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = class Queue extends Command {
	constructor(client) {
		super(client, {
			name: "queue",
			description: client.cmdConfig.queue.description,
			usage: client.cmdConfig.queue.usage,
			permissions: client.cmdConfig.queue.permissions,
      aliases: client.cmdConfig.queue.aliases,
			category: "music",
			enabled: client.cmdConfig.queue.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (!queue.tracks.toArray()[0])
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.empty, this.client.embeds.error_color)] });

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray().map((m, i) => {
        return `\`#${i + 1}\` **${m.title}** | ${currentTrack.requestedBy.toString()} ([Song](${m.url}))`;
    });

    this.client.paginateContent(this.client, tracks, 10, 1, message, this.client.language.music.queue.title, this.client.embeds.general_color);
  }

  async slashRun(interaction, args) {
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.queue.ephemeral });

    if (!queue.tracks.toArray()[0])
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.empty, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.queue.ephemeral });

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray().map((m, i) => {
        return `\`#${i + 1}\` **${m.title}** | ${currentTrack.requestedBy.toString()} ([Song](${m.url}))`;
    });

    this.client.paginateContent(this.client, tracks, 10, 1, interaction, this.client.language.music.queue.title, this.client.embeds.general_color);
  }
};
