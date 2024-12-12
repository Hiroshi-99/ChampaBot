const Command = require("../../structures/Command");
let { EmbedBuilder, GuildFeature, Guild } = require("discord.js");

module.exports = class ServerInfo extends Command {
	constructor(client) {
		super(client, {
			name: "serverinfo",
			description: client.cmdConfig.serverinfo.description,
			usage: client.cmdConfig.serverinfo.usage,
			permissions: client.cmdConfig.serverinfo.permissions,
      aliases: client.cmdConfig.serverinfo.aliases,
			category: "member",
			enabled: client.cmdConfig.serverinfo.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.server_info.color);
    if(this.client.embeds.server_info.title) embed.setTitle(this.client.embeds.server_info.title);
    
    if(this.client.embeds.server_info.description) embed.setDescription(this.client.embeds.server_info.description.replace("<name>", message.guild.name)
      .replace("<id>", message.guild.id)
      .replace("<boostCount>", message.guild.premiumSubscriptionCount)
      .replace("<createdAt>", `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>`)
      .replace("<channels>", message.guild.channels.cache.size)
      .replace("<vanityInvite>", message.guild.features.includes(GuildFeature['VanityURL']) ? message.guild.vanityURLCode : "N/A")
      .replace("<roles>", message.guild.roles.cache.size)
      .replace("<bots>", message.guild.members.cache.filter(m => m.user.bot).size)
      .replace("<members>", message.guild.memberCount));
    
    let field = this.client.embeds.server_info.fields;
    for(let i = 0; i < this.client.embeds.server_info.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<name>", message.guild.name)
        .replace("<id>", message.guild.id)
        .replace("<boostCount>", message.guild.premiumSubscriptionCount)
        .replace("<createdAt>", `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>`)
        .replace("<channels>", message.guild.channels.cache.size)
        .replace("<vanityInvite>", message.guild.features.includes(GuildFeature['VanityURL']) ? message.guild.vanityURLCode : "N/A")
        .replace("<roles>", message.guild.roles.cache.size)
        .replace("<bots>", message.guild.members.cache.filter(m => m.user.bot).size)
        .replace("<members>", message.guild.memberCount), inline: true }]);
    }
    
    if(this.client.embeds.server_info.footer == true ) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.server_info.thumbnail == true) embed.setThumbnail(message.guild.iconURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.server_info.color);
    if(this.client.embeds.server_info.title) embed.setTitle(this.client.embeds.server_info.title);
    
    if(this.client.embeds.server_info.description) embed.setDescription(this.client.embeds.server_info.description.replace("<name>", interaction.guild.name)
      .replace("<id>", interaction.guild.id)
      .replace("<boostCount>", interaction.guild.premiumSubscriptionCount)
      .replace("<createdAt>", `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:F>`)
      .replace("<channels>", interaction.guild.channels.cache.size)
      .replace("<vanityInvite>", interaction.guild.features.includes(GuildFeature['VanityURL']) ? interaction.guild.vanityURLCode : "N/A")
      .replace("<roles>", interaction.guild.roles.cache.size)
      .replace("<bots>", interaction.guild.members.cache.filter(m => m.user.bot).size)
      .replace("<members>", interaction.guild.memberCount));
    
    let field = this.client.embeds.server_info.fields;
    for(let i = 0; i < this.client.embeds.server_info.fields.length; i++) {
    embed.addFields([{ name: field[i].title, value: field[i].description.replace("<name>", interaction.guild.name)
      .replace("<id>", interaction.guild.id)
      .replace("<boostCount>", interaction.guild.premiumSubscriptionCount)
      .replace("<createdAt>", `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:F>`)
      .replace("<channels>", interaction.guild.channels.cache.size)
      .replace("<vanityInvite>", interaction.guild.features.includes(GuildFeature['VanityURL']) ? interaction.guild.vanityURLCode : "N/A")
      .replace("<roles>", interaction.guild.roles.cache.size)
      .replace("<bots>", interaction.guild.members.cache.filter(m => m.user.bot).size)
      .replace("<members>", interaction.guild.memberCount), inline: true }]);
    }
    
    if(this.client.embeds.server_info.footer == true ) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.server_info.thumbnail == true) embed.setThumbnail(interaction.guild.iconURL());
    
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.serverinfo.ephemeral });
  }
};
