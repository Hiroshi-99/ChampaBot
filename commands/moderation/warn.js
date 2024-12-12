const Command = require("../../structures/Command");

const Discord = require("discord.js");

module.exports = class Warn extends Command {
	constructor(client) {
		super(client, {
			name: "warn",
			description: client.cmdConfig.warn.description,
			usage: client.cmdConfig.warn.usage,
			permissions: client.cmdConfig.warn.permissions,
      aliases: client.cmdConfig.warn.aliases,
			category: "moderation",
			enabled: client.cmdConfig.warn.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Warn',
        required: true,
      }, {
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Warn Reason',
        required: false,
      }]
		});
	}
  
  async run(message, args) {
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.warn.usage)] });
    let reason = args.slice(1).join(" ");
    
    if ((member.permissions.has("KickMembers") || member.permissions.has("ManageMessages")) && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });
  
    if (message.author.id == member.id)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
  
    if(!reason) reason = this.client.language.moderation.no_reason
  
    let warns = await this.client.database.usersData().get(`${member.id}.warns`);

    await this.client.database.usersData().add(`${member.id}.warns`, 1);
  
    let warnEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.warn, this.client.language.moderation.warned.replace("<user>", member.user.username)
      .replace("<staff>", message.author.username)
      .replace("<warns>", Number(warns + 1))
      .replace("<reason>", reason), this.client.embeds.success_color);
  
    let dmEmbed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.punishments.warned_dm.color);
    if(this.client.embeds.punishments.warned_dm.title) dmEmbed.setTitle(this.client.embeds.punishments.warned_dm.title);

    if(this.client.embeds.punishments.warned_dm.description) dmEmbed.setDescription(this.client.embeds.punishments.warned_dm.description.replace("<staff>", message.author.username)
      .replace("<reason>", reason)
      .replace("<warns>", Number(warns + 1))
      .replace("<guild>", message.guild.name)
      .replace("<user>", member.user.username));

    let field = this.client.embeds.punishments.warned_dm.fields;
    for(let i = 0; i < this.client.embeds.punishments.warned_dm.fields.length; i++) {
    dmEmbed.addFields([{ name: field[i].title, value: field[i].description.replace("<staff>", message.author.username)
      .replace("<reason>", reason)
      .replace("<warns>", Number(warns + 1))
      .replace("<guild>", message.guild.name)
      .replace("<user>", member.user.username) }]);
    }

    if(this.client.embeds.punishments.warned_dm.footer == true) dmEmbed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
    if(this.client.embeds.punishments.warned_dm.thumbnail == true) dmEmbed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

    if(this.client.config.general.dm_punishment == true)
      await member.send({ embeds: [dmEmbed] }).catch((err) => { });

    message.channel.send({ embeds: [warnEmbed] });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.warned)
      .replace("<staff>", message.author.username));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.warn, [{
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
      desc: "Permanent"
    }, {
      name: this.client.language.titles.logs.fields.warns,
      desc: `${Number(warns + 1)}`
    }], member.user, "WARN");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: message.author.id,
      author: message.author.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      message: `user_warned`
    });
  } 
  async slashRun(interaction, args) {
    let member = interaction.options.getMember("user");
    let reason = interaction.options.getString("reason");
    
    if ((member.permissions.has("KickMembers") || member.permissions.has("ManageMessages")) && !interaction.member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.warn.ephemeral });
  
    if (interaction.user.id == member.id)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.warn.ephemeral });

    if(!reason) reason = this.client.language.moderation.no_reason

    let warns = await this.client.database.usersData().get(`${member.id}.warns`);
  
    await this.client.database.usersData().add(`${member.id}.warns`, 1);

    let warnEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.warn, this.client.language.moderation.warned.replace("<user>", member.user.username)
      .replace("<staff>", interaction.user.username)
      .replace("<warns>", Number(warns + 1))
      .replace("<reason>", reason), this.client.embeds.success_color);

    let dmEmbed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.punishments.warned_dm.color);
    if(this.client.embeds.punishments.warned_dm.title) dmEmbed.setTitle(this.client.embeds.punishments.warned_dm.title);

    if(this.client.embeds.punishments.warned_dm.description) dmEmbed.setDescription(this.client.embeds.punishments.warned_dm.description.replace("<staff>", interaction.user.username)
      .replace("<reason>", reason)
      .replace("<warns>", Number(warns + 1))
      .replace("<guild>", interaction.guild.name)
      .replace("<user>", member.user.username));

    let field = this.client.embeds.punishments.warned_dm.fields;
    for(let i = 0; i < this.client.embeds.punishments.warned_dm.fields.length; i++) {
    dmEmbed.addFields([{ name: field[i].title, value: field[i].description.replace("<staff>", interaction.user.username)
      .replace("<reason>", reason)
      .replace("<warns>", Number(warns + 1))
      .replace("<guild>", interaction.guild.name)
      .replace("<user>", member.user.username) }]);
    }

    if(this.client.embeds.punishments.warned_dm.footer == true) dmEmbed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
    if(this.client.embeds.punishments.warned_dm.thumbnail == true) dmEmbed.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    if(this.client.config.general.dm_punishment == true)
      await member.send({ embeds: [dmEmbed] }).catch((err) => { });

    interaction.reply({ embeds: [warnEmbed], ephemeral: this.client.cmdConfig.warn.ephemeral });

    await this.client.utils.pushInf(this.client, member.id, this.client.language.moderation.history.format
      .replace("<date>", `<t:${Math.floor(new Date().getTime() / 1000)}:f>`)
      .replace("<user>", member.user.username)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.warned)
      .replace("<staff>", interaction.user.username));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.warn, [{
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
    }, {
      name: this.client.language.titles.logs.fields.warns,
      desc: `${Number(warns + 1)}`
    }], member.user, "WARN");

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: interaction.user.id,
      author: interaction.user.username,
      user_id: member.id,
      user: member.user.username,
      reason,
      message: `user_warned`
    });
  }
};
