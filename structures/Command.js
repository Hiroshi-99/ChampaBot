const Discord = require("discord.js");

module.exports = class Command {
  constructor(client, options) {
    this.client = client;
    this.name = options.name;
    this.type = options.type || Discord.ApplicationCommandType.ChatInput;
    this.usage = options.usage || 'No Usage';
    this.description = options.description || 'N/A';
    this.enabled = options.enabled;
    this.aliases = options.aliases || 'N/A';
    this.permissions = options.permissions || [];
    this.category = options.category || "member";
    this.slash = options.slash || false;
    this.context = options.context || false;
    this.options = options.options || [];
  }
};