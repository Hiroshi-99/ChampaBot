const Command = require("../../structures/Command");
const { useQueue } = require("discord-player");

module.exports = class Stop extends Command {
	constructor(client) {
		super(client, {
			name: "stop",
			description: client.cmdConfig.stop.description,
			usage: client.cmdConfig.stop.usage,
			permissions: client.cmdConfig.stop.permissions,
      aliases: client.cmdConfig.stop.aliases,
			category: "music",
			enabled: client.cmdConfig.stop.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    await queue.delete();

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.stopped, this.client.embeds.general_color)] });
  }

  async slashRun(interaction, args) {
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.stop.ephemeral });

    await queue.delete();

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.stopped, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.stop.ephemeral });
  }
};