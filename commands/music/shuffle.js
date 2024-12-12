const Command = require("../../structures/Command");
const { useQueue } = require("discord-player");

module.exports = class Shuffle extends Command {
	constructor(client) {
		super(client, {
			name: "shuffle",
			description: client.cmdConfig.shuffle.description,
			usage: client.cmdConfig.shuffle.usage,
			permissions: client.cmdConfig.shuffle.permissions,
      aliases: client.cmdConfig.shuffle.aliases,
			category: "music",
			enabled: client.cmdConfig.shuffle.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (queue.tracks.length < 3)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.need_three, this.client.embeds.error_color)] });

    queue.tracks.shuffle();

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.shuffled, this.client.embeds.general_color)] });
  }

  async slashRun(interaction, args) {
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.shuffle.ephemeral });

    if (queue.tracks.length < 3)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.need_three, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.shuffle.ephemeral });

    queue.tracks.shuffle();

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.shuffled, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.shuffle.ephemeral });
  }
};