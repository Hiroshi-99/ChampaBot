const Command = require("../../structures/Command");
const Discord = require("discord.js");

const yaml = require("yaml");
const fs = require("fs");

module.exports = class Plugin extends Command {
  constructor(client) {
    super(client, {
      name: "plugin",
      description: client.cmdConfig.plugin.description,
      usage: client.cmdConfig.plugin.usage,
      permissions: client.cmdConfig.plugin.permissions,
      aliases: client.cmdConfig.command.aliases,
      category: "administration",
      enabled: client.cmdConfig.plugin.enabled,
      slash: true,
      options: [{
        name: "plugin",
        description: "Name of plugin to toggle on/off",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const name = args[0];
    const pluginsList = Object.keys(this.client.config.plugins).filter((p) => p != "general" && p != "birthday")
      .map((pl) => pl);

    if(!name || !pluginsList.includes(name.toLowerCase()))
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.invalid_plugin_name.replace("<plugins>", pluginsList.join(", ")), this.client.embeds.error_color)] });
    
    let doc = yaml.parseDocument(fs.readFileSync('./configs/config.yml', 'utf8'));
    doc.setIn(`plugins.${name}.enabled`.split("."), !this.client.config.plugins[name].enabled);
  
    const documentToString = doc.toString({ lineWidth: 100000, doubleQuotedAsJSON: true, singleQuote: false, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" })
		.replaceAll(/(\[ )/gm, "[")
		.replaceAll(/( ])$/gm, "]");

	  fs.writeFileSync('./configs/config.yml', documentToString, 'utf-8');
	  this.client.config = doc.toJSON();

    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.plugin_toggled.replace("<name>", name.toLowerCase()).replace("<status>", this.client.config.plugins[name].enabled ? "enabled" : "disabled"), this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    const name = interaction.options.getString("plugin");
    const pluginsList = Object.keys(this.client.config.plugins).filter((p) => p != "general" && p != "birthday")
      .map((pl) => pl);

    if(!name || !pluginsList.includes(name.toLowerCase()))
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.invalid_plugin_name.replace("<plugins>", pluginsList.join(", ")), this.client.embeds.error_color)] });
    
    let doc = yaml.parseDocument(fs.readFileSync('./configs/config.yml', 'utf8'));
    doc.setIn(`plugins.${name}.enabled`.split("."), !this.client.config.plugins[name].enabled);
  
    const documentToString = doc.toString({ lineWidth: 100000, doubleQuotedAsJSON: true, singleQuote: false, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" })
		.replaceAll(/(\[ )/gm, "[")
		.replaceAll(/( ])$/gm, "]");

	  fs.writeFileSync('./configs/config.yml', documentToString, 'utf-8');
	  this.client.config = doc.toJSON();

    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.plugin_toggled.replace("<name>", name.toLowerCase()).replace("<status>", this.client.config.plugins[name].enabled ? "enabled" : "disabled"), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.plugin.ephemeral });
  }
};
