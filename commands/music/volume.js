const Command = require("../../structures/Command");
const { ApplicationCommandOptionType } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = class Volume extends Command {
	constructor(client) {
		super(client, {
			name: "volume",
			description: client.cmdConfig.volume.description,
			usage: client.cmdConfig.volume.usage,
			permissions: client.cmdConfig.volume.permissions,
      aliases: client.cmdConfig.volume.aliases,
			category: "music",
			enabled: client.cmdConfig.volume.enabled,
      slash: true,
      options: [{
        name: "volume",
        type: ApplicationCommandOptionType.Number,
        description: "Volume percent",
        required: false,
      }]
		});
	}

  async run(message, args) {
    let volume = args[0]

    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if(!volume)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.volume.current.replace("<volume>", queue.node.volume), this.client.embeds.general_color)] });

    if(isNaN(volume) || volume > 200 || volume < 0)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.volume.limit, this.client.embeds.error_color)] });

    queue.node.setVolume(Number(volume));

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.volume.changed.replace("<volume>", volume), this.client.embeds.general_color)] });
  }

  async slashRun(interaction, args) {
    let volume = interaction.options.getNumber("volume");

    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.volume.ephemeral });

    if(!volume)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.volume.current.replace("<volume>", queue.node.volume), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.volume.ephemeral });

    if(isNaN(volume) || volume > 200 || volume < 0)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.volume.limit, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.volume.ephemeral });

    queue.node.setVolume(volume);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.volume.changed.replace("<volume>", volume), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.volume.ephemeral });
  }
};