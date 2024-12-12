const Command = require("../../structures/Command");
const Discord = require("discord.js");
const ms = require("ms");

module.exports = class Mute extends Command {
	constructor(client) {
		super(client, {
			name: "mute",
			description: client.cmdConfig.mute.description,
			usage: client.cmdConfig.mute.usage,
			permissions: client.cmdConfig.mute.permissions,
			aliases: client.cmdConfig.mute.aliases, 
			category: "moderation",
			enabled: client.cmdConfig.mute.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Mute',
        required: true,
      }, {
        name: 'duration',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Mute Duration',
        required: true,
      }, {
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Mute Reason',
        required: false,
      }]
		});
	}

  async run(message, args) {
    let config = this.client.config;
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.mute.usage)] });
    
    if (message.member === member)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
    
    const botRole = message.guild.members.cache.get(this.client.user.id).roles.highest;
    if ((member.permissions.has("ModerateMembers") && !message.member.permissions.has("Administrator")) || 
      member.roles.highest.position > botRole.position || member.permissions.has("Administrator"))
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });
  
    let duration = args[1];
  
    if (!duration) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.invalid_duration, this.client.embeds.error_color)] });
    let time = ms(duration);
    if (isNaN(time) || time == 0) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.invalid_duration, this.client.embeds.error_color)] });
  
    let reason = args.slice(2).join(" ");
    if (!reason) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.no_reason, this.client.embeds.error_color)] });
  
    if (reason.length > 100) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.reason_long, this.client.embeds.error_color)] });
  
    if (member.isCommunicationDisabled()) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.already_muted, this.client.embeds.error_color)] });
  
    let dmEmbed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.punishments.muted_dm.color);
    if(this.client.embeds.punishments.muted_dm.title) dmEmbed.setTitle(this.client.embeds.punishments.muted_dm.title);

    if(this.client.embeds.punishments.muted_dm.description) dmEmbed.setDescription(this.client.embeds.punishments.muted_dm.description.replace("<staff>", message.author.username)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<guild>", message.guild.name)
      .replace("<user>", member.user.username));

    let field = this.client.embeds.punishments.muted_dm.fields;
    for(let i = 0; i < this.client.embeds.punishments.muted_dm.fields.length; i++) {
    dmEmbed.addFields([{ name: field[i].title, value: field[i].description.replace("<staff>", message.author.username)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<guild>", message.guild.name)
      .replace("<user>", member.user.username) }]);
    }

    if(this.client.embeds.punishments.muted_dm.footer == true) dmEmbed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
    if(this.client.embeds.punishments.muted_dm.thumbnail == true) dmEmbed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

    if(this.client.config.general.dm_punishment == true)
      await member.send({ embeds: [dmEmbed] }).catch((err) => { });
    
    await member.timeout(time, reason);
  
    let muteEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.mute, this.client.language.moderation.muted.replace("<user>", member.user.username)
      .replace("<staff>", message.author.username)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<reason>", reason), this.client.embeds.success_color);
    
    message.channel.send({ embeds: [muteEmbed] });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<punishment>", this.client.language.moderation.history.muted)
      .replace("<staff>", message.author.username));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.mute, [{
      name: this.client.language.titles.logs.fields.user,
      desc: `${member.user.username}`
    }, {
      name: this.client.language.titles.logs.fields.staff,
      desc: `${message.author.username}`
    }, {
      name: this.client.language.titles.logs.fields.reason,
      desc: reason
    }, {
      name: this.client.language.titles.logs.fields.duration,
      desc: this.client.utils.formatTime(time)
    }], member.user, "MUTE");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: message.author.id,
      author: message.author.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      duration: this.client.utils.formatTime(time),
      message: `user_muted`
    });
  }

  async slashRun(interaction, args) {
    let config = this.client.config;
    let member = interaction.options.getMember("user");

    if (interaction.member === member)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    const botRole = interaction.guild.members.cache.get(this.client.user.id).roles.highest;
    if ((member.permissions.has("ModerateMembers") && !interaction.member.permissions.has("Administrator")) || 
      member.roles.highest.position > botRole.position || member.permissions.has("Administrator"))
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    let duration = args[1];

    if (!duration) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.invalid_duration, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
    let time = ms(duration);
    if (isNaN(time) || time == 0) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.invalid_duration, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    let reason = args.slice(2).join(" ");
    if (!reason) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.no_reason, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    if (reason.length > 100) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.reason_long, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    if (member.isCommunicationDisabled()) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.already_muted, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    let dmEmbed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.punishments.muted_dm.color);
    if(this.client.embeds.punishments.muted_dm.title) dmEmbed.setTitle(this.client.embeds.punishments.muted_dm.title);

    if(this.client.embeds.punishments.muted_dm.description) dmEmbed.setDescription(this.client.embeds.punishments.muted_dm.description.replace("<staff>", interaction.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", duration)
      .replace("<guild>", interaction.guild.name)
      .replace("<user>", member.user.username));

    let field = this.client.embeds.punishments.muted_dm.fields;
    for(let i = 0; i < this.client.embeds.punishments.muted_dm.fields.length; i++) {
    dmEmbed.addFields([{ name: field[i].title, value: field[i].description.replace("<staff>", interaction.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", duration)
      .replace("<guild>", interaction.guild.name)
      .replace("<user>", member.user.username) }]);
    }

    if(this.client.embeds.punishments.muted_dm.footer == true) dmEmbed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
    if(this.client.embeds.punishments.muted_dm.thumbnail == true) dmEmbed.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    if(this.client.config.general.dm_punishment == true)
      await member.send({ embeds: [dmEmbed] }).catch((err) => { });
    
    await member.timeout(time, reason);

    let muteEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.mute, this.client.language.moderation.muted.replace("<user>", member.user.username)
      .replace("<staff>", interaction.user.username)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<reason>", reason), this.client.embeds.success_color);
    
    interaction.reply({ embeds: [muteEmbed], ephemeral: this.client.cmdConfig.mute.ephemeral });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<punishment>", this.client.language.moderation.history.muted)
      .replace("<staff>", interaction.user.username));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.mute, [{
      name: this.client.language.titles.logs.fields.user,
      desc: `${member.user.username}`
    }, {
      name: this.client.language.titles.logs.fields.staff,
      desc: `${interaction.user.username}`
    }, {
      name: this.client.language.titles.logs.fields.reason,
      desc: reason
    }, {
      name: this.client.language.titles.logs.fields.duration,
      desc: this.client.utils.formatTime(time)
    }], member.user, "MUTE");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: interaction.user.id,
      author: interaction.user.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      duration: this.client.utils.formatTime(time),
      message: `user_muted`
    });
  }
};
