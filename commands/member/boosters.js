const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = class Boosters extends Command {
	constructor(client) {
		super(client, {
			name: "boosters",
			description: client.cmdConfig.boosters.description,
			usage: client.cmdConfig.boosters.usage,
			permissions: client.cmdConfig.boosters.permissions,
      aliases: client.cmdConfig.boosters.aliases,
			category: "member",
			enabled: client.cmdConfig.boosters.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const boostersList = message.guild.roles.premiumSubscriberRole ? 
      message.guild.roles.premiumSubscriberRole.members.map((m) => m) : [];
    const boostsCount = message.guild.premiumSubscriptionCount;

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.boosters.color);
    if(this.client.embeds.boosters.title) embed.setTitle(this.client.embeds.boosters.title);
    
    if(this.client.embeds.boosters.description) embed.setDescription(this.client.embeds.boosters.description.replace("<boostersList>", boostersList.length > 0 ? boostersList.join(", ").slice(0, -1) : "N/A")
      .replace("<boostersCount>", boostersList.length)
      .replace("<boosterRole>", message.guild.roles.premiumSubscriberRole ? message.guild.roles.premiumSubscriberRole : "N/A")
      .replace("<guildName>", message.guild.name)
      .replace("<boostsCount>", boostsCount));
    
    let field = this.client.embeds.boosters.fields;
    for(let i = 0; i < this.client.embeds.boosters.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<boostersList>", boostersList.length > 0 ? boostersList.join(", ").slice(0, -1) : "N/A")
        .replace("<boostersCount>", boostersList.length)
        .replace("<boosterRole>", message.guild.roles.premiumSubscriberRole ? message.guild.roles.premiumSubscriberRole : "N/A")
        .replace("<guildName>", message.guild.name)
        .replace("<boostsCount>", boostsCount), inline: true }]);
    }
    
    if(this.client.embeds.boosters.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.boosters.thumbnail == true) embed.setThumbnail(message.guild.iconURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    const boostersList = interaction.guild.roles.premiumSubscriberRole ? 
    interaction.guild.roles.premiumSubscriberRole.members.map((m) => m) : [];
    const boostsCount = interaction.guild.premiumSubscriptionCount;

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.boosters.color);
    if(this.client.embeds.boosters.title) embed.setTitle(this.client.embeds.boosters.title);
    
    if(this.client.embeds.boosters.description) embed.setDescription(this.client.embeds.boosters.description.replace("<boostersList>", boostersList.length > 0 ? boostersList.join(", ") : "N/A")
      .replace("<boostersCount>", boostersList.length)
      .replace("<boosterRole>", interaction.guild.roles.premiumSubscriberRole ? interaction.guild.roles.premiumSubscriberRole : "N/A")
      .replace("<guildName>", interaction.guild.name)
      .replace("<boostsCount>", boostsCount));
    
    let field = this.client.embeds.boosters.fields;
    for(let i = 0; i < this.client.embeds.boosters.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<boostersList>", boostersList.length > 0 ? boostersList.join(", ") : "N/A")
      .replace("<boostersCount>", boostersList.length)
      .replace("<boosterRole>", interaction.guild.roles.premiumSubscriberRole ? interaction.guild.roles.premiumSubscriberRole : "N/A")
      .replace("<guildName>", interaction.guild.name)
      .replace("<boostsCount>", boostsCount), inline: true }]);
    }
    
    if(this.client.embeds.boosters.footer == true) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.boosters.thumbnail == true) embed.setThumbnail(interaction.guild.iconURL());

    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.boosters.ephemeral })
  }
};
