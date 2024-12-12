const Command = require("../../structures/Command");
const { useQueue } = require("discord-player");

module.exports = class Skip extends Command {
	constructor(client) {
		super(client, {
			name: "skip",
			description: client.cmdConfig.skip.description,
			usage: client.cmdConfig.skip.usage,
			permissions: client.cmdConfig.skip.permissions,
      aliases: client.cmdConfig.skip.aliases,
			category: "music",
			enabled: client.cmdConfig.skip.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (queue.tracks.length < 1 && queue.repeatMode !== 3)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.empty, this.client.embeds.error_color)] });

    queue.node.skip();
    queue.node.setPaused(false);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.skipped, this.client.embeds.general_color)] });
  }

  async slashRun(interaction, args) {
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.skip.ephemeral });

    if (queue.tracks.length < 1 && queue.repeatMode !== 3)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.empty, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.skip.ephemeral });

    queue.node.skip();
    queue.node.setPaused(false);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.skipped, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.skip.ephemeral });
  }
};