const Command = require("../../structures/Command");
let { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = class RoleInfo extends Command {
	constructor(client) {
		super(client, {
			name: "roleinfo",
			description: client.cmdConfig.roleinfo.description,
			usage: client.cmdConfig.roleinfo.usage,
			permissions: client.cmdConfig.roleinfo.permissions,
      aliases: client.cmdConfig.roleinfo.aliases,
			category: "member",
			enabled: client.cmdConfig.roleinfo.enabled,
      slash: true,
      options: [{
        name: "role",
        description: "Role which info to view",
        type: ApplicationCommandOptionType.Role,
        required: true
      }]
		});
	}

  async run(message, args) {
    let role = message.mentions.roles.first();
    if(!role) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.roleinfo.usage)]});

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.role_info.color);
    if(this.client.embeds.role_info.title) embed.setTitle(this.client.embeds.role_info.title);
    
    if(this.client.embeds.role_info.description) embed.setDescription(this.client.embeds.role_info.description.replace("<role>", role.name)
      .replace("<id>", role.id)
      .replace("<createdAt>", `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`)
      .replace("<mentionable>", role.mentionable)
      .replace("<color>", role.hexColor)
      .replace("<position>", role.rawPosition)
      .replace("<permissions>", new PermissionsBitField(role.permissions).toArray().join(", ").replaceAll("_", " ").trim()));
    
    let field = this.client.embeds.role_info.fields;
    for(let i = 0; i < this.client.embeds.role_info.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<role>", role.name)
      .replace("<id>", role.id)
      .replace("<createdAt>", `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`)
      .replace("<mentionable>", role.mentionable)
      .replace("<color>", role.hexColor)
      .replace("<position>", role.rawPosition)
      .replace("<permissions>", new PermissionsBitField(role.permissions).toArray().join(", ").replaceAll("_", " ").trim()), inline: true }]);
    }
    
    if(this.client.embeds.role_info.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.role_info.thumbnail == true && role.icon) embed.setThumbnail(role.iconURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let role = interaction.options.getRole("role");

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.role_info.color);
    if(this.client.embeds.role_info.title) embed.setTitle(this.client.embeds.role_info.title);
    
    if(this.client.embeds.role_info.description) embed.setDescription(this.client.embeds.role_info.description.replace("<role>", role.name)
      .replace("<id>", role.id)
      .replace("<createdAt>", `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`)
      .replace("<mentionable>", role.mentionable)
      .replace("<color>", role.hexColor)
      .replace("<position>", role.rawPosition)
      .replace("<permissions>", new PermissionsBitField(role.permissions).toArray().join(", ").replaceAll("_", " ").trim()));
    
    let field = this.client.embeds.role_info.fields;
    for(let i = 0; i < this.client.embeds.role_info.fields.length; i++) {
    embed.addFields([{ name: field[i].title, value: field[i].description.replace("<role>", role.name)
      .replace("<id>", role.id)
      .replace("<createdAt>", `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`)
      .replace("<mentionable>", role.mentionable)
      .replace("<color>", role.hexColor)
      .replace("<position>", role.rawPosition)
      .replace("<permissions>", new PermissionsBitField(role.permissions).toArray().join(", ").replaceAll("_", " ").trim()), inline: true }]);
    }
    
    if(this.client.embeds.role_info.footer == true ) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.role_info.thumbnail == true && role.icon) embed.setThumbnail(role.iconURL());
    
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.serverinfo.ephemeral });
  }
};
