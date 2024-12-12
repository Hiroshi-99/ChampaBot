const Command = require("../../structures/Command");
const { useQueue } = require("discord-player");

module.exports = class Resume extends Command {
	constructor(client) {
		super(client, {
			name: "resume",
			description: client.cmdConfig.resume.description,
			usage: client.cmdConfig.resume.usage,
			permissions: client.cmdConfig.resume.permissions,
      aliases: client.cmdConfig.resume.aliases,
			category: "music",
			enabled: client.cmdConfig.resume.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });
    
    if (queue.node.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.not_paused, this.client.embeds.error_color)] });

    queue.node.setPaused(false);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.resumed, this.client.embeds.general_color)] });
  }

  async slashRun(interaction, args) {
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.resume.ephemeral });

    if (queue.node.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.not_paused, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.resume.ephemeral });

    queue.node.setPaused(false);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.resumed, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.resume.ephemeral });
  }
};