const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = class ChannelInfo extends Command {
	constructor(client) {
		super(client, {
			name: "channelinfo",
			description: client.cmdConfig.channelinfo.description,
			usage: client.cmdConfig.channelinfo.usage,
			permissions: client.cmdConfig.channelinfo.permissions,
      aliases: client.cmdConfig.channelinfo.aliases,
			category: "member",
			enabled: client.cmdConfig.channelinfo.enabled,
      slash: true,
      options: [{
        name: "channel",
        type: ApplicationCommandOptionType.Channel,
        description: "Channel which information to see",
        required: false
      }]
		});
	}

  async run(message, args) {
    let channel = message.mentions.channels.first() || message.channel;

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.channel_info.color);
    if(this.client.embeds.channel_info.title) embed.setTitle(this.client.embeds.channel_info.title);
    
    if(this.client.embeds.channel_info.description) embed.setDescription(this.client.embeds.channel_info.description.replace("<name>", channel.name)
      .replace("<id>", channel.id)
      .replace("<type>", ChannelType[channel.type])
      .replace("<topic>", channel.topic ? channel.topic : "N/A")
      .replace("<position>", channel.position)
      .replace("<parent>", channel.parent ? channel.parent : "N/A")
      .replace("<lastMessageId>", channel.lastMessageId)
      .replace("<nsfw>", channel.nsfw == true ? "Yes" : "No"));
    
    let field = this.client.embeds.channel_info.fields;
    for(let i = 0; i < this.client.embeds.channel_info.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<name>", channel.name)
        .replace("<id>", channel.id)
        .replace("<type>", ChannelType[channel.type])
        .replace("<topic>", channel.topic ? channel.topic : "N/A")
        .replace("<position>", channel.position)
        .replace("<parent>", channel.parent ? channel.parent : "N/A")
        .replace("<lastMessageId>", channel.lastMessageId)
        .replace("<nsfw>", channel.nsfw == true ? "Yes" : "No"), inline: true }]);
    }
    
    if(this.client.embeds.channel_info.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.channel_info.thumbnail == true) embed.setThumbnail(message.guild.iconURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let channel = interaction.options.getChannel("channel") || interaction.channel;
    
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.channel_info.color);
    if(this.client.embeds.channel_info.title) embed.setTitle(this.client.embeds.channel_info.title);
    
    if(this.client.embeds.channel_info.description) embed.setDescription(this.client.embeds.channel_info.description.replace("<name>", channel.name)
      .replace("<id>", channel.id)
      .replace("<type>", ChannelType[channel.type])
      .replace("<topic>", channel.topic ? channel.topic : "N/A")
      .replace("<position>", channel.position)
      .replace("<parent>", channel.parent ? channel.parent : "N/A")
      .replace("<lastMessageId>", channel.lastMessageId)
      .replace("<nsfw>", channel.nsfw == true ? "Yes" : "No"));
    
    let field = this.client.embeds.channel_info.fields;
    for(let i = 0; i < this.client.embeds.channel_info.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<name>", channel.name)
        .replace("<id>", channel.id)
        .replace("<type>", ChannelType[channel.type])
        .replace("<topic>", channel.topic ? channel.topic : "N/A")
        .replace("<position>", channel.position)
        .replace("<parent>", channel.parent ? channel.parent : "N/A")
        .replace("<lastMessageId>", channel.lastMessageId)
        .replace("<nsfw>", channel.nsfw == true ? "Yes" : "No"), inline: true }]);
    }
    
    if(this.client.embeds.channel_info.footer == true) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.channel_info.thumbnail == true) embed.setThumbnail(interaction.guild.iconURL());

    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.channelinfo.ephemeral })
  }
};
