const Command = require("../../structures/Command");
let { ApplicationCommandOptionType } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = class RemoveSong extends Command {
	constructor(client) {
		super(client, {
			name: "removesong",
			description: client.cmdConfig.removesong.description,
			usage: client.cmdConfig.removesong.usage,
			permissions: client.cmdConfig.removesong.permissions,
      aliases: client.cmdConfig.removesong.aliases,
			category: "music",
			enabled: client.cmdConfig.removesong.enabled,
      slash: true,
      options: [{
        name: "number",
        type: ApplicationCommandOptionType.Number,
        description: "ID of Song which to Remove",
        required: false
      }]
		});
	}

  async run(message, args) {
    let id = args[0];
    if(!id || isNaN(id)) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.removesong.usage)] });

    const queue = useQueue(message.guild.id);

    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (queue.tracks.length < 1)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    const number = (id - 1);

    if (!number || number < 0 || number > queue.tracks.length)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.cannot_find, this.client.embeds.error_color)] });

    await queue.node.remove(number);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.removed.replace("<number>", (number + 1)), this.client.embeds.general_color)] });
  }

  async slashRun(interaction, args) {
    let id = interaction.options.getNumber("number");

    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removesong.ephemeral });

    if (queue.tracks.length < 1)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removesong.ephemeral });

    const number = (id - 1);

    console.log(queue.tracks.length)
    if (!number || number < 0 || number > queue.tracks.length)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.cannot_find, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removesong.ephemeral });

    await queue.node.remove(number);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.removed.replace("<number>", (number + 1)), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.removesong.ephemeral });
  }
};