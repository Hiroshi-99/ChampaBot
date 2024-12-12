const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = class NowPlaying extends Command {
	constructor(client) {
		super(client, {
			name: "nowplaying",
			description: client.cmdConfig.nowplaying.description,
			usage: client.cmdConfig.nowplaying.usage,
			permissions: client.cmdConfig.nowplaying.permissions,
      aliases: client.cmdConfig.nowplaying.aliases,
			category: "music",
			enabled: client.cmdConfig.nowplaying.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    let embed = new EmbedBuilder()
      .setTitle("Now Playing")
      .setDescription(`[${queue.currentTrack.title}](${queue.currentTrack.url}) by **${queue.currentTrack.author}**.
**Requested by:** ${queue.currentTrack.requestedBy.toString()}

> ${queue.node.createProgressBar()}`)
      .setColor("Yellow")
      .setThumbnail(queue.currentTrack.thumbnail);

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.nowplaying.ephemeral });

    let embed = new EmbedBuilder()
      .setTitle("Now Playing")
      .setDescription(`[${queue.currentTrack.title}](${queue.currentTrack.url}) by **${queue.currentTrack.author}**.
**Requested by:** ${queue.currentTrack.requestedBy.toString()}

> ${queue.node.createProgressBar()}`)
      .setColor("Yellow")
      .setThumbnail(queue.currentTrack.thumbnail);

    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.nowplaying.ephemeral });
  }
};
