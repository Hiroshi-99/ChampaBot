const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require("discord.js");
const { useQueue, QueueRepeatMode } = require("discord-player");

module.exports = class Search extends Command {
	constructor(client) {
		super(client, {
			name: "search",
			description: client.cmdConfig.search.description,
			usage: client.cmdConfig.search.usage,
			permissions: client.cmdConfig.search.permissions,
      aliases: client.cmdConfig.search.aliases,
			category: "music",
			enabled: client.cmdConfig.search.enabled,
      slash: true,
      options: [{
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "Song/Link to search",
        required: true
      }]
		});
	}

  async run(message, args) {
    let song = args.join(" ");
    if(!args[0]) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.play.usage)] });
  
    const guildQueue = useQueue(message.guild.id);
    const channel = message.member.voice.channel;
  
    if(!channel)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.not_voice, this.client.embeds.error_color)] });
  
    if(guildQueue && channel.id !== message.guild.members.me.voice.channelId)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.diff_voice, this.client.embeds.error_color)] });
  
    let m = await message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.searching.replace("<song>", song), this.client.embeds.general_color)] });

    let result = await this.client.player.search(song, { requestedBy: message.author }).catch(() => {});
    if (!result || !result.tracks.length)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.not_found.replace("<song>", song), this.client.embeds.error_color)] });
  
    let songList = result.tracks.map((song) => {
      const songDesc = `${song.title} - ${song.author} (${song.duration})`
      return {
        label: song.title.length > 25 ? song.title.slice(0, 23) + ".." : song.title,
        description: songDesc.length > 50 ? songDesc.slice(0, 48) + ".." : songDesc,
        value: song.id
      }
    });

    if(songList.length > 25) 
      songList = songList.slice(0, 25);

    const songSelect = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId("search_select_rack")
        .setPlaceholder(this.client.language.music.play.select_placeholder)
        .addOptions(songList)
    );

    await m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.found_select.replace("<song>", song), this.client.embeds.general_color)], components: [songSelect] })

    const filter = (i) => i.user.id == message.author.id && i.customId == "search_select_rack";
    await m.awaitMessageComponent({ filter, time: 120_000, componentType: ComponentType.StringSelect }).then(async(i) => {
      await i.deferUpdate();
      const selectedSong = result.tracks.find((t) => t.id == i.values[0]);

      const { queue, track, searchResult } = await this.client.player.play(channel, selectedSong, {
        nodeOptions: {
          metadata: { channel: message.channel },
          playerOptions: {
            volume: this.client.config.plugins.music.initial_volume,
            repeatMode: QueueRepeatMode.AUTOPLAY,
            noEmitInsert: true,
            leaveOnStop: true,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 60_000,
            leaveOnEnd: true,
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
        if(queue.isPlaying()) {
          m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.pl_added
            .replace("<title>", result.playlist.title)
            .replace("<tracks>", result.tracks.length)
            .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(selectedSong.playlist.thumbnail ? selectedSong.playlist.thumbnail.url : null)], components: [] });
        } else {
          m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.pl_playing
            .replace("<title>", result.playlist.title)
            .replace("<tracks>", result.tracks.length)
            .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(selectedSong.playlist.thumbnail ? selectedSong.playlist.thumbnail.url : null)], components: [] });
        }
      } else {
        if(queue.isPlaying()) {
          m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.song_added
            .replace("<title>", selectedSong.title)
            .replace("<duration>", selectedSong.duration)
            .replace("<author>", selectedSong.author), this.client.embeds.success_color).setThumbnail(selectedSong.thumbnail ? selectedSong.thumbnail : null)], components: [] });
        } else {
          m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.music.title, this.client.language.music.play.song_playing
            .replace("<title>", selectedSong.title)
            .replace("<duration>", selectedSong.duration)
            .replace("<author>", selectedSong.author), this.client.embeds.success_color).setThumbnail(selectedSong.thumbnail ? selectedSong.thumbnail : null)], components: [] });
        }
      }
    }).catch(async(err) => {
      songSelect.components[0].setDisabled(true);
      await m.edit({ components: [songSelect] })
    });
  }

  async slashRun(interaction, args) {
    let song = interaction.options.getString("query")

    const guildQueue = useQueue(interaction.guild.id);
    const channel = interaction.member.voice.channel;
  
    if(!channel)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.not_voice, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.search.ephemeral });
  
    if(guildQueue && channel.id !== interaction.guild.members.me.voice.channelId)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.diff_voice, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.search.ephemeral });
  
    let m = await interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.searching.replace("<song>", song), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.search.ephemeral });

    let result = await this.client.player.search(song, { requestedBy: interaction.user }).catch(() => {});
    if (!result || !result.tracks.length)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.not_found.replace("<song>", song), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.search.ephemeral });
  
    let songList = result.tracks.map((song) => {
      const songDesc = `${song.title} - ${song.author} (${song.duration})`
      return {
        label: song.title.length > 25 ? song.title.slice(0, 23) + ".." : song.title,
        description: songDesc.length > 50 ? songDesc.slice(0, 48) + ".." : songDesc,
        value: song.id
      }
    });

    if(songList.length > 25) 
      songList = songList.slice(0, 25);

    const songSelect = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId("search_select_rack")
        .setPlaceholder(this.client.language.music.play.select_placeholder)
        .addOptions(songList)
    );

    await interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.found_select.replace("<song>", song), this.client.embeds.general_color)], components: [songSelect] })

    const filter = (i) => i.user.id == interaction.user.id && i.customId == "search_select_rack";
    await m.awaitMessageComponent({ filter, time: 120_000, componentType: ComponentType.StringSelect }).then(async(i) => {
      await i.deferUpdate();
      const selectedSong = result.tracks.find((t) => t.id == i.values[0]);

      const { queue, track, searchResult } = await this.client.player.play(channel, selectedSong, {
        nodeOptions: {
          metadata: { channel: interaction.channel },
          playerOptions: {
            volume: this.client.config.plugins.music.initial_volume,
            repeatMode: QueueRepeatMode.AUTOPLAY,
            noEmitInsert: true,
            leaveOnStop: true,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 60_000,
            leaveOnEnd: true,
            leaveOnEndCooldown: 60_000,
            pauseOnEmpty: true,
            preferBridgedMetadata: true,
            disableBiquad: true,
          },
        },
        requestedBy: interaction.user,
        connectionOptions: { deaf: true },
      });

      if(result.hasPlaylist()) {
        if(queue.isPlaying()) {
          interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.pl_added
            .replace("<title>", result.playlist.title)
            .replace("<tracks>", result.tracks.length)
            .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(selectedSong.playlist.thumbnail ? selectedSong.playlist.thumbnail.url : null)], components: [] });
        } else {
          interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.pl_playing
            .replace("<title>", result.playlist.title)
            .replace("<tracks>", result.tracks.length)
            .replace("<author>", result.playlist.author.name), this.client.embeds.success_color).setThumbnail(selectedSong.playlist.thumbnail ? selectedSong.playlist.thumbnail.url : null)], components: [] });
        }
      } else {
        if(queue.isPlaying()) {
          interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.song_added
            .replace("<title>", selectedSong.title)
            .replace("<duration>", selectedSong.duration)
            .replace("<author>", selectedSong.author), this.client.embeds.success_color).setThumbnail(selectedSong.thumbnail ? selectedSong.thumbnail : null)], components: [] });
        } else {
          interaction.editReply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.music.title, this.client.language.music.play.song_playing
            .replace("<title>", selectedSong.title)
            .replace("<duration>", selectedSong.duration)
            .replace("<author>", selectedSong.author), this.client.embeds.success_color).setThumbnail(selectedSong.thumbnail ? selectedSong.thumbnail : null)], components: [] });
        }
      }
    }).catch(async(err) => {
      songSelect.components[0].setDisabled(true);
      await interaction.editReply({ components: [songSelect] })
    });
  }
};