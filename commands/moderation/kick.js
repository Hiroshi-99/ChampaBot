const Command = require("../../structures/Command");

const Discord = require("discord.js")

module.exports = class Kick extends Command {
	constructor(client) {
		super(client, {
			name: "kick",
			description: client.cmdConfig.kick.description,
			usage: client.cmdConfig.kick.usage,
			permissions: client.cmdConfig.kick.permissions,
      aliases: client.cmdConfig.kick.aliases,
			category: "moderation",
			enabled: client.cmdConfig.kick.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Kick',
        required: true,
      }, {
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Kick Reason',
        required: false,
      }]
		});
	}
  
  async run(message, args) {
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.kick.usage)] });

    const botRole = message.guild.members.cache.get(this.client.user.id).roles.highest;
    if (member.permissions.has("KickMembers") && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)] });
    
    if (message.author.id == member.id)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });

    if (!member.kickable || 
      member.roles.highest.position > botRole.position || member.permissions.has("Administrator"))
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });

    let reason = args.slice(1).join(" ");
    if (!args[1]) reason = this.client.language.moderation.no_reason;

    await member.kick(reason);

    let kickEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.kick, this.client.language.moderation.kicked.replace("<user>", member.user.username)
      .replace("<staff>", message.author.username)
      .replace("<reason>", reason), this.client.embeds.success_color);

    message.channel.send({ embeds: [kickEmbed] });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.kicked)
      .replace("<staff>", message.author.username));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.kick, [{
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
      desc: "N/A"
    }], member.user, "KICK");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: message.author.id,
      author: message.author.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      message: `user_kicked`
    });
  }
  async slashRun(interaction, args) {
    let member = interaction.options.getMember("user");
    
    const botRole = interaction.guild.members.cache.get(this.client.user.id).roles.highest;
    if (member.permissions.has("KickMembers") && !interaction.member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });

    if (interaction.user.id == member.id)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.kick.ephemeral });

    if (!member.kickable || 
      member.roles.highest.position > botRole.position || member.permissions.has("Administrator"))
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.kick.ephemeral });

    let reason = interaction.options.getString("reason");
    if (!reason) reason = this.client.language.moderation.no_reason;

    await member.kick(reason);

    let kickEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.kick, this.client.language.moderation.kicked.replace("<user>", member.user.username)
      .replace("<staff>", interaction.user.username)
      .replace("<reason>", reason), this.client.embeds.success_color);

    interaction.reply({ embeds: [kickEmbed], ephemeral: this.client.cmdConfig.kick.ephemeral });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.kicked)
      .replace("<staff>", interaction.user.username));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.kick, [{
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
      desc: "Permanent"
    }], member.user, "KICK");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: interaction.user.id,
      author: interaction.user.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      message: `user_kicked`
    });
  }
};
