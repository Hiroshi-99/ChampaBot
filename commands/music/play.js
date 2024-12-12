const Command = require("../../structures/Command");
let { ApplicationCommandOptionType } = require("discord.js");
const { useMainPlayer, QueryType, QueueRepeatMode, useQueue  } = require("discord-player");

module.exports = class Play extends Command {
	constructor(client) {
		super(client, {
			name: "play",
			description: client.cmdConfig.play.description,
			usage: client.cmdConfig.play.usage,
			permissions: client.cmdConfig.play.permissions,
      aliases: client.cmdConfig.play.aliases,
			category: "music",
			enabled: client.cmdConfig.play.enabled,
      slash: true,
      options: [{
        name: "song",
        type: ApplicationCommandOptionType.String,
        description: "Song/Link to play",
        required: true
      }]
		});
	}

  async run(message, args) {
    let song = args.join(" ");
    if(!args[0]) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.play.usage)] });
  
    const guildQueue = useQueue(message.guild.id);
    const player = useMainPlayer();

    const result = await player.search(song, {
      searchEngine: QueryType.AUTO,
      requestedBy: message.author,
    });
  
    const channel = message.member.voice.channel;
  
    if(!channel)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.not_voice, this.client.embeds.error_color)] });
  
    if(guildQueue && channel.id !== message.guild.members.me.voice.channelId)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.diff_voice, this.client.embeds.error_color)] });
    let m = await message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.searching.replace("<song>", song), this.client.embeds.general_color)] });

    if (!result || !result.hasTracks())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.not_found.replace("<song>", song), this.client.embeds.error_color)] });

    const { queue, track, searchResult } = await player.play(channel, result, {
      nodeOptions: {
        metadata: { channel: message.channel },
        playerOptions: {
          volume: 70,
          repeatMode: QueueRepeatMode.AUTOPLAY,
          noEmitInsert: true,
          leaveOnStop: true,
          leaveOnEmpty: true,
          leaveOnEnd: true,
          leaveOnStopCooldown: 60_000,
          leaveOnEmptyCooldown: 60_000,
          leaveOnEndCooldown: 60_000,
          pauseOnEmpty: true,
          preferBridgedMetadata: true,
          disableBiquad: true,
        },
      },
      requestedBy: message.author,
      connectionOptions: { deaf: true },
    });

    if(result.hasPlaylist()) {
      if(queue?.isPlaying()) {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.pl_added
          .replace("<title>", result.playlist.title)
          .replace("<tracks>", result.tracks.length)
          .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(result.playlist.thumbnail ? result.playlist.thumbnail.url : null)] });
      } else {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.pl_playing
          .replace("<title>", result.playlist.title)
          .replace("<tracks>", result.tracks.length)
          .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(result.playlist.thumbnail ? result.playlist.thumbnail.url : null)] });
      }
    } else {
      if(queue?.isPlaying()) {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.song_added
          .replace("<title>", result.tracks[0].title)
          .replace("<duration>", result.tracks[0].duration)
          .replace("<author>", result.tracks[0].author), this.client.embeds.success_color).setThumbnail(result.tracks[0]?.thumbnail ? result.tracks[0]?.thumbnail : null)] });
      } else {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.song_playing
          .replace("<title>", result.tracks[0].title)
          .replace("<duration>", result.tracks[0].duration)
          .replace("<author>", result.tracks[0].author), this.client.embeds.success_color).setThumbnail(result.tracks[0]?.thumbnail ? result.tracks[0]?.thumbnail : null)] });
      }
    }
  }

  async slashRun(interaction, args) {
    let song = interaction.options.getString("song");

    const guildQueue = useQueue(interaction.guild.id);
    const player = useMainPlayer();

    const result = await player.search(song, {
      searchEngine: QueryType.AUTO,
      requestedBy: interaction.user,
    });

    const channel = interaction.member.voice.channel;

    if(!channel)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.not_voice, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    if(guildQueue && channel.id !== interaction.guild.members.me.voice.channelId)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.diff_voice, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    await interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.searching.replace("<song>", song), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.play.ephemeral });
    if (!result || !result.hasTracks())
      return interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.not_found.replace("<song>", song), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    const { queue, track, searchResult } = await player.play(channel, result, {
      nodeOptions: {
        metadata: { channel: interaction.channel },
        volume: 70,
        repeatMode: QueueRepeatMode.AUTOPLAY,
        noEmitInsert: true,
        leaveOnStop: true,
        leaveOnEmpty: true,
        leaveOnEnd: true,
        leaveOnStopCooldown: 60_000,
        leaveOnEmptyCooldown: 60_000,
        leaveOnEndCooldown: 60_000,
        pauseOnEmpty: true,
        preferBridgedMetadata: true,
        disableBiquad: true,
      },
      requestedBy: interaction.user,
      connectionOptions: { deaf: true },
    });

    if(result.hasPlaylist()) {
      if(queue?.isPlaying()) {
        await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.pl_added
          .replace("<title>", result.playlist.title)
          .replace("<tracks>", result.tracks.length)
          .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(result.playlist.thumbnail ? result.playlist.thumbnail.url : null)] });
      } else {
        await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.pl_playing
          .replace("<title>", result.playlist.title)
          .replace("<tracks>", result.tracks.length)          
          .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(result.playlist.thumbnail ? result.playlist.thumbnail.url : null)] });
      }
    } else {
      if(queue?.isPlaying()) {
        await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.song_added
          .replace("<title>", result.tracks[0].title)
          .replace("<duration>", result.tracks[0].duration)
          .replace("<author>", result.tracks[0].author), this.client.embeds.success_color).setThumbnail(result.tracks[0]?.thumbnail ? result.tracks[0]?.thumbnail : null)] });
      } else {
        await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.song_playing
          .replace("<title>", result.tracks[0].title)
          .replace("<duration>", result.tracks[0].duration)
          .replace("<author>", result.tracks[0].author), this.client.embeds.success_color).setThumbnail(result.tracks[0]?.thumbnail ? result.tracks[0]?.thumbnail : null)] });
      }
    }
  }
};