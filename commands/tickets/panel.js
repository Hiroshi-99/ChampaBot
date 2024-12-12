const Command = require("../../structures/Command");
const { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");

module.exports = class Panel extends Command {
	constructor(client) {
		super(client, {
			name: "panel",
			description: client.cmdConfig.panel.description,
			usage: client.cmdConfig.panel.usage,
			permissions: client.cmdConfig.panel.permissions,
      aliases: client.cmdConfig.panel.aliases,
			category: "tickets",
			enabled: client.cmdConfig.panel.enabled,
      slash: true,
		});
	}
  
  async run(message, args) {
    let config = this.client.config;

    const embed = new EmbedBuilder()
      .setTitle(this.client.embeds.panel.title)
      .setDescription(this.client.embeds.panel.description)
      .setColor(this.client.embeds.panel.color)

    if(this.client.embeds.panel.footer == true) embed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
    if(this.client.embeds.panel.thumbnail) embed.setThumbnail(this.client.embeds.panel.thumbnail);
    
    const openBttn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setStyle(ButtonStyle.Primary)
        .setLabel(this.client.language.buttons.tickets.open_ticket)
        .setEmoji(config.emojis.tickets.open_ticket || {})
    );

    message.channel.send({ embeds: [embed], components: [openBttn] });
  }
  async slashRun(interaction, args) {
    let config = this.client.config;

    const embed = new EmbedBuilder()
      .setTitle(this.client.embeds.panel.title)
      .setDescription(this.client.embeds.panel.description)
      .setColor(this.client.embeds.panel.color)

    if(this.client.embeds.panel.footer == true) embed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
    if(this.client.embeds.panel.thumbnail) embed.setThumbnail(this.client.embeds.panel.thumbnail);
    
    const openBttn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setStyle(ButtonStyle.Primary)
        .setLabel(this.client.language.buttons.tickets.open_ticket)
        .setEmoji(config.emojis.tickets.open_ticket || {})
    );

    await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.panel, this.client.embeds.success_color)], ephemeral: true });

    interaction.channel.send({ embeds: [embed], components: [openBttn] });
  }
};