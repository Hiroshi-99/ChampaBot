const Command = require("../../structures/Command");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const fetch = require("node-fetch");

module.exports = class MCServer extends Command {
  constructor(client) {
    super(client, {
      name: "mcserver",
      description: client.cmdConfig.mcserver.description,
      usage: client.cmdConfig.mcserver.usage,
      permissions: client.cmdConfig.mcserver.permissions,
      aliases: client.cmdConfig.mcserver.aliases,
      category: "member",
      enabled: client.cmdConfig.mcserver.enabled,
      slash: true,
      options: [{
        name: "ip",
        type: ApplicationCommandOptionType.String,
        description: "IP of Server",
        required: true
      }]
    });
  }

  async run(message, args) {
    let ip = args[0];

    if(!ip) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.mcserver.usage)]});

    const serverData = await fetch(`https://api.mcsrvstat.us/2/${ip}`, {
      method: "GET",
    }).then(async(res) => await res.json());

    if(!serverData.ip || serverData.ip == "127.0.0.1")
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.invalid_server, this.client.embeds.error_color)] });

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.mc_server.color);
    if(this.client.embeds.mc_server.title) embed.setTitle(this.client.embeds.mc_server.title);
    
    if(this.client.embeds.mc_server.description) embed.setDescription(this.client.embeds.mc_server.description.replace("<ip>", serverData.ip || "N/A")
      .replace("<port>", serverData.port || "N/A")
      .replace("<hostname>", serverData.hostname || "N/A")
      .replace("<online>", serverData.online == true ? "Online" : "Offline")
      .replace("<players>", serverData.players?.online || 0)
      .replace("<maxPlayers>", serverData.players?.max || 0)
      .replace("<version>", serverData.version || "N/A")
      .replace("<plugins>", serverData.plugins ? serverData.plugins.join(", ").slice(0, -11) : "N/A")
      .replace("<software>", serverData.software || "N/A"));
    
    let field = this.client.embeds.mc_server.fields;
    for(let i = 0; i < this.client.embeds.mc_server.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<ip>", serverData.ip || "N/A")
      .replace("<port>", serverData.port || "N/A")
      .replace("<hostname>", serverData.hostname || "N/A")
      .replace("<online>", serverData.online == true ? "Online" : "Offline")
      .replace("<players>", serverData.players?.online || 0)
      .replace("<maxPlayers>", serverData.players?.max || 0)
      .replace("<version>", serverData.version || "N/A")
      .replace("<plugins>", serverData.plugins ? serverData.plugins.join(", ").slice(0, -11) : "N/A")
      .replace("<software>", serverData.software || "N/A"), inline: true }]);
    }
    
    if(this.client.embeds.mc_server.footer == true ) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.mc_server.thumbnail == true) embed.setThumbnail(message.guild.iconURL());

    message.channel.send({ embeds: [embed] });
  }
  async slashRun(interaction, args) {
    let ip = interaction.options.getString("ip");

    const serverData = await fetch(`https://api.mcsrvstat.us/2/${ip}`, {
      method: "GET",
    }).then(async(res) => await res.json());

    if(!serverData.ip || serverData.ip == "127.0.0.1")
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.invalid_server, this.client.embeds.error_color)] });
    
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.mc_server.color);
    if(this.client.embeds.mc_server.title) embed.setTitle(this.client.embeds.mc_server.title);
    
    if(this.client.embeds.mc_server.description) embed.setDescription(this.client.embeds.mc_server.description.replace("<ip>", serverData.ip || "N/A")
      .replace("<port>", serverData.port || "N/A")
      .replace("<hostname>", serverData.hostname || "N/A")
      .replace("<online>", serverData.online == true ? "Online" : "Offline")
      .replace("<players>", serverData.players?.online || 0)
      .replace("<maxPlayers>", serverData.players?.max || 0)
      .replace("<version>", serverData.version || "N/A")
      .replace("<plugins>", serverData.plugins ? serverData.plugins.join(", ").slice(0, -11) : "N/A")
      .replace("<software>", serverData.software || "N/A"));
    
    let field = this.client.embeds.mc_server.fields;
    for(let i = 0; i < this.client.embeds.mc_server.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<ip>", serverData.ip || "N/A")
      .replace("<port>", serverData.port || "N/A")
      .replace("<hostname>", serverData.hostname || "N/A")
      .replace("<online>", serverData.online == true ? "Online" : "Offline")
      .replace("<players>", serverData.players?.online || 0)
      .replace("<maxPlayers>", serverData.players?.max || 0)
      .replace("<version>", serverData.version || "N/A")
      .replace("<plugins>", serverData.plugins ? serverData.plugins.join(", ").slice(0, -11) : "N/A")
      .replace("<software>", serverData.software || "N/A"), inline: true }]);
    }
    
    if(this.client.embeds.mc_server.footer == true ) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.mc_server.thumbnail == true) embed.setThumbnail(interaction.guild.iconURL());

    interaction.reply({ embeds: [embed] });
  }
};
