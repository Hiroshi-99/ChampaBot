const Command = require("../../structures/Command");
let { ApplicationCommandOptionType } = require("discord.js");
const { QueueRepeatMode, useQueue } = require("discord-player");

module.exports = class Loop extends Command {
	constructor(client) {
		super(client, {
			name: "loop",
			description: client.cmdConfig.loop.description,
			usage: client.cmdConfig.loop.usage,
			permissions: client.cmdConfig.loop.permissions,
      aliases: client.cmdConfig.loop.aliases,
			category: "music",
			enabled: client.cmdConfig.loop.enabled,
      slash: true,
      options: [{
        name: "type",
        type: ApplicationCommandOptionType.String,
        description: "What to loop",
        required: false,
        choices: [
          {
            name: "Turn Off",
            value: "off"
          },
          {
            name: "Song",
            value: "song"
          },
          {
            name: "Queue",
            value: "queue"
          }
        ]
      }]
		});
	}
  
  async run(message, args) {
    let type = args[0];
    if(!type || (type != "off" && type != "song" && type != "queue")) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.loop.usage)] });
    const queue = useQueue(message.guild.id);
  
    if (!queue || !queue.isPlaying())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });
  
    let current = "none";
    if (queue.repeatMode == 2) {
      current = "queue";
    } else if (queue.repeatMode == 1) {
      current = "song";
    } else if (queue.repeatMode == 0) {
      current = "off";
    }
  
    if(!type) message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.queue.status.replace("<status>", current), this.client.embeds.general_color)] });
  
    switch (type) {
      case "off":
        queue.setRepeatMode(QueueRepeatMode.OFF);
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.queue.loop_disabled, this.client.embeds.general_color)] });
        break;
      case "song":
        queue.setRepeatMode(QueueRepeatMode.TRACK);
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.queue.song_loop, this.client.embeds.general_color)] });
        break;
      case "queue":
        queue.setRepeatMode(QueueRepeatMode.QUEUE);
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.queue.queue_loop, this.client.embeds.general_color)] });
        break;
      default:
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.queue.status.replace("<status>", current), this.client.embeds.general_color)] });
    }
  }
  
  async slashRun(interaction, args) {
    let type = interaction.options.getString("type");
    const queue = useQueue(interaction.guild.id);

    if (!queue || !queue.isPlaying())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.loop.ephemeral });

    let current = "none";
    if (queue.repeatMode == 2) {
      current = "queue";
    } else if (queue.repeatMode == 1) {
      current = "song";
    } else if (queue.repeatMode == 0) {
      current = "off";
    }

    if(!type) interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.queue.status.replace("<status>", current), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.loop.ephemeral });

    switch (type) {
      case "off":
        queue.setRepeatMode(QueueRepeatMode.OFF);
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.queue.loop_disabled, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.loop.ephemeral });
        break;
      case "song":
        queue.setRepeatMode(QueueRepeatMode.TRACK);
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.queue.song_loop, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.loop.ephemeral });
        break;
      case "queue":
        queue.setRepeatMode(QueueRepeatMode.QUEUE);
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.queue.queue_loop, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.loop.ephemeral });
        break;
      default:
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.queue.status.replace("<status>", current), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.loop.ephemeral });
    }
  }
};