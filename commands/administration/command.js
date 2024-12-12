const Command = require("../../structures/Command");
const Discord = require("discord.js");

const yaml = require("yaml");
const fs = require("fs");

module.exports = class CommandToggle extends Command {
  constructor(client) {
    super(client, {
      name: "command",
      description: client.cmdConfig.command.description,
      usage: client.cmdConfig.command.usage,
      permissions: client.cmdConfig.command.permissions,
      aliases: client.cmdConfig.command.aliases,
      category: "administration",
      enabled: client.cmdConfig.command.enabled,
      slash: true,
      options: [{
        name: "command",
        description: "Name of command to toggle on/off",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const name = args[0];
    const cmdsList = this.client.commands.map((cmd) => cmd.name);

    if(!name || !cmdsList.includes(name.toLowerCase()))
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.invalid_cmd_name.replace("<commands>", cmdsList.join(", ")), this.client.embeds.error_color)] });
    
    let doc = yaml.parseDocument(fs.readFileSync('./configs/commands.yml', 'utf8'));
    doc.setIn(`${name}.enabled`.split("."), !this.client.cmdConfig[name].enabled);
  
    const documentToString = doc.toString({ lineWidth: 100000, doubleQuotedAsJSON: true })
      .replaceAll(/(\[ )/gm, "[")
      .replaceAll(/( ])$/gm, "]");
    
    fs.writeFileSync('./configs/commands.yml', documentToString, 'utf-8');
    this.client.cmdConfig = doc.toJSON();

    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.cmd_toggled.replace("<name>", name.toLowerCase()).replace("<status>", this.client.cmdConfig[name].enabled ? "enabled" : "disabled"), this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    const name = interaction.options.getString("name");
    const cmdsList = this.client.commands.map((cmd) => cmd.name);

    if(!name || !cmdsList.includes(name.toLowerCase()))
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.invalid_cmd_name.replace("<commands>", cmdsList.join(", ")), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.command.ephemeral });
    
    let doc = yaml.parseDocument(fs.readFileSync('./configs/commands.yml', 'utf8'));
    doc.setIn(`${name}.enabled`.split("."), !this.client.cmdConfig[name].enabled);
  
    const documentToString = doc.toString({ lineWidth: 100000, doubleQuotedAsJSON: true })
      .replaceAll(/(\[ )/gm, "[")
      .replaceAll(/( ])$/gm, "]");
    
    fs.writeFileSync('./configs/commands.yml', documentToString, 'utf-8');
    this.client.cmdConfig = doc.toJSON();

    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.cmd_toggled.replace("<name>", name.toLowerCase()).replace("<status>", this.client.cmdConfig[name].enabled ? "enabled" : "disabled"), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.command.ephemeral });
  }
};
