const Command = require("../../structures/Command");

const ms = require("ms");
const Discord = require("discord.js");

module.exports = class Ban extends Command {
	constructor(client) {
		super(client, {
			name: "tempban",
			description: client.cmdConfig.tempban.description,
			usage: client.cmdConfig.tempban.usage,
			permissions: client.cmdConfig.tempban.permissions,
      aliases: client.cmdConfig.tempban.aliases,
			category: "moderation",
			enabled: client.cmdConfig.tempban.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Ban',
        required: true,
      }, {
        name: 'duration',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Duration of Ban',
        required: true,
      }, {
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Ban Reason',
        required: false,
      }]
		});
	}

  async run(message, args) {
    let config = this.client.config;
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.tempban.usage)] });

    const botRole = message.guild.members.cache.get(this.client.user.id).roles.highest;
    if (member.permissions.has("BanMembers") && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)] });
    
    if (message.author.id == member.id)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
  
    if (!member.bannable || 
      member.roles.highest.position > botRole.position || member.permissions.has("Administrator")) return message.channel.sendmessage.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });
    let time = args[1];
    let reason = args.slice(2).join(" ");
    if (!reason) reason = this.client.language.moderation.no_reason;
  
    await this.client.database.usersData().set(`${member.id}.tempBan`, {
      endsAt: Date.now() + ms(time)
    });

    member.ban({ reason });
  
    setTimeout(() => message.guild.bans.remove(member), ms(time));
  
    let tempEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.tempban, this.client.language.moderation.tempbanned.replace("<user>", member.user.username)
      .replace("<staff>", message.author.username)
      .replace("<duration>", this.client.utils.formatTime(ms(time)))
      .replace("<reason>", reason), this.client.embeds.success_color);

    message.channel.send({ embeds: [tempEmbed] });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(ms(time)))
      .replace("<punishment>", this.client.language.moderation.history.temp + " " + this.client.language.moderation.history.banned)
      .replace("<staff>", message.author.username));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.tempban, [{
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
      desc: time
    }], member.user, "TEMP_BAN");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: message.author.id,
      author: message.author.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      duration: this.client.utils.formatTime(time),
      message: `user_banned`
    });
  }

  async slashRun(interaction, args) {
    let config = this.client.config;
    let member = interaction.options.getMember("user");

    const botRole = interaction.guild.members.cache.get(this.client.user.id).roles.highest;
    if (member.permissions.has("BanMembers") && !interaction.member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.tempban.ephemeral });
    
    if (interaction.user.id == member.id)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.tempban.ephemeral });

    if (!member.bannable || 
      member.roles.highest.position > botRole.position || member.permissions.has("Administrator")) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.tempban.ephemeral });
    let reason = interaction.options.getString("reason");
    if (!reason) reason = this.client.language.moderation.no_reason;

    let time = interaction.options.getString("duration");

    await this.client.database.usersData().set(`${member.id}.tempBan`, {
      endsAt: Date.now() + ms(time)
    });

    member.ban({ reason });

    setTimeout(() => interaction.guild.bans.remove(member), ms(time));

    let tempEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.tempban, this.client.language.moderation.tempbanned.replace("<user>", member.user.username)
      .replace("<staff>", interaction.user.username)
      .replace("<duration>", this.client.utils.formatTime(ms(time)))
      .replace("<reason>", reason), this.client.embeds.success_color);

    interaction.reply({ embeds: [tempEmbed], ephemeral: this.client.cmdConfig.tempban.ephemeral });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(ms(time)))
      .replace("<punishment>", this.client.language.moderation.history.temp + " " + this.client.language.moderation.history.banned)
      .replace("<staff>", interaction.user.username));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.tempban, [{
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
      desc: time
    }], member.user, "TEMP_BAN");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: interaction.user.id,
      author: interaction.user.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      duration: this.client.utils.formatTime(time),
      message: `user_banned`
    });
  }
};
