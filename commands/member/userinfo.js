const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = class UserInfo extends Command {
	constructor(client) {
		super(client, {
			name: "userinfo",
			description: client.cmdConfig.userinfo.description,
			usage: client.cmdConfig.userinfo.usage,
			permissions: client.cmdConfig.userinfo.permissions,
      aliases: client.cmdConfig.userinfo.aliases,
			category: "member",
			enabled: client.cmdConfig.userinfo.enabled,
      slash: true,
      options: [{
        name: "user",
        type: ApplicationCommandOptionType.User,
        description: "User whose Info to view",
        required: false
      }]
		});
	}

  async run(message, args) {
    let user = message.mentions.users.first() || message.author;
    let member = message.guild.members.cache.get(user.id);

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.user_info.color);
    if(this.client.embeds.user_info.title) embed.setTitle(this.client.embeds.user_info.title);
    
    if(this.client.embeds.user_info.description) embed.setDescription(this.client.embeds.user_info.description.replace("<user>", user.username)
      .replace("<username>", user.username)
      .replace("<highestRole>", member.roles.highest)
      .replace("<roles>", `${[...member.roles.cache.values()].sort((a, b) => b.rawPosition - a.rawPosition).map((r) => r).join(", ").trim()}`)
      .replace("<joinedAt>", `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`)
      .replace("<createdAt>", `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`)
      .replace("<id>", user.id));
    
    let field = this.client.embeds.user_info.fields;
    for(let i = 0; i < this.client.embeds.user_info.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<user>", user.username)
        .replace("<username>", user.username)
        .replace("<highestRole>", member.roles.highest)
        .replace("<roles>", `${[...member.roles.cache.values()].sort((a, b) => b.rawPosition - a.rawPosition).map((r) => r).join(", ").trim()}`)
        .replace("<joinedAt>", `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`)
        .replace("<createdAt>", `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`)
        .replace("<id>", user.id), inline: true }]);
    }
    
    if(this.client.embeds.user_info.footer == true ) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.user_info.thumbnail == true) embed.setThumbnail(user.displayAvatarURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let user = interaction.options.getUser("user") || interaction.user;
    let member = interaction.guild.members.cache.get(user.id);
    
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.user_info.color);
    if(this.client.embeds.user_info.title) embed.setTitle(this.client.embeds.user_info.title);
    
    if(this.client.embeds.user_info.description) embed.setDescription(this.client.embeds.user_info.description.replace("<user>", user.username)
      .replace("<username>", user.username)
      .replace("<highestRole>", member.roles.highest)
      .replace("<roles>", `${[...member.roles.cache.values()].sort((a, b) => b.rawPosition - a.rawPosition).map((r) => r).join(", ").trim()}`)
      .replace("<joinedAt>", `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`)
      .replace("<createdAt>", `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`)
      .replace("<id>", user.id));
    
    let field = this.client.embeds.user_info.fields;
    for(let i = 0; i < this.client.embeds.user_info.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<user>", user.username)
        .replace("<username>", user.username)
        .replace("<highestRole>", member.roles.highest)
        .replace("<roles>", `${[...member.roles.cache.values()].sort((a, b) => b.rawPosition - a.rawPosition).map((r) => r).join(", ").trim()}`)
        .replace("<joinedAt>", `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`)
        .replace("<createdAt>", `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`)
        .replace("<id>", user.id), inline: true }]);
    }
    
    if(this.client.embeds.user_info.footer == true) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.user_info.thumbnail == true) embed.setThumbnail(user.displayAvatarURL());
    
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.userinfo.ephemeral });
  }
};
