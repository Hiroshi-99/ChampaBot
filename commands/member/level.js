const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType, AttachmentBuilder } = require("discord.js");

const Canvas = require("canvas");

module.exports = class Level extends Command {
	constructor(client) {
		super(client, {
			name: "level",
			description: client.cmdConfig.level.description,
			usage: client.cmdConfig.level.usage,
			permissions: client.cmdConfig.level.permissions,
      aliases: client.cmdConfig.level.aliases,
			category: "member",
			enabled: client.cmdConfig.level.enabled,
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
    if(this.client.config.plugins.leveling.enabled == false) return;

    if(user.bot) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_bot, this.client.embeds.error_color)] });

    const userData = await this.client.database.usersData().get(`${user.id}`) || {};

    let level = userData.level || 1;
    let xp = userData.xp || 0;

    const nextLevel = parseInt(level) + 1;
    const xpNeeded = nextLevel * 2 * 250 + 250;

    let every = (await this.client.database.usersData().all()).sort((a, b) => (b.value?.level ?? b.level) - (a.value?.level ?? a.level));
    let rank = every.map(x => x.id).indexOf(user.id) + 1 || 'N/A';

    if(this.client.config.plugins.leveling.rank_style == "CARD") {
      const member = message.guild.members.cache.get(user.id);
      let presence = member.presence;
      if(presence == null) presence = "offline";
      else presence = presence.status;

      const formatXP = xp > 1000 ? (xp / 1000).toFixed(2) + "K" : xp;
      const formatXPNeeded = xpNeeded > 1000 ? (xpNeeded / 1000).toFixed(2) + "K" : xpNeeded;

      const rankColor = this.client.config.plugins.leveling.card_color_role == true ? member.roles.highest.color.toString(16) : this.client.config.plugins.leveling.card_color_default.replace("#", "");

      let color = "#737f8d";
      switch(presence) {
        case 'offline':
          color = "#737f8d"
        break;
        case 'online':
          color = "#3ba55b" 
        break;
        case 'idle':
          color = "#f9a61a"
        break;
        case 'dnd':
          color = "#ec4145"
        break;
      }

      let canvas = Canvas.createCanvas(910, 300);
      let ctx = canvas.getContext('2d');
      
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, 110);
      ctx.fillStyle = `#${rankColor}`;
      ctx.fill();
      ctx.closePath()

      ctx.beginPath();
      ctx.rect(0, 110, canvas.width, 190);
      ctx.fillStyle = "#23272a";
      ctx.fill();
      ctx.closePath();
      
      ctx.fillStyle = "#FFFFFF";

      ctx.lineWidth = 25;
      ctx.beginPath();
      ctx.lineTo(910 - 50, 235)
      ctx.lineTo(910 - 50, 240)
      ctx.lineTo(50, 240)
      ctx.strokeStyle = "#FFFFFF"
      ctx.stroke()
      ctx.closePath();
      ctx.fill()
      ctx.restore();

      ctx.fillStyle = `#${rankColor}`;

      ctx.beginPath();
      if((50 + Math.floor((xp / xpNeeded) * 810)) <= 66) {
        ctx.lineTo(66, 235)
        ctx.lineTo(66, 240)
      } else {
        ctx.lineTo(50 + Math.floor((xp / xpNeeded) * 810), 235)
        ctx.lineTo(50 + Math.floor((xp / xpNeeded) * 810), 240)
      }
      ctx.lineTo(50, 240)
      ctx.strokeStyle = `#${rankColor}`;
      ctx.stroke();
      ctx.closePath();
      ctx.fill()
      ctx.restore();

      ctx.font = "25px Arial";
      ctx.fillStyle = "#f0EDED";
      ctx.fillText(`${formatXP}`, 650, 205);
      let xpWidth = ctx.measureText(`${formatXP}`).width;

      ctx.fillStyle = "#FEFEFE";
      ctx.fillText(`/${formatXPNeeded} XP`, 650 + xpWidth, 205);

      ctx.font = '30px calibri';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${user.username}`, 220, 145);

      ctx.font = '23px calibri';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Rank: #${rank}`, 220, 175);

      ctx.font = '23px calibri';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Level: ${level}`, 220, 200);

      const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: "png" }));
      ctx.beginPath();
      ctx.arc(120, 110, 70, 0, Math.PI * 2, true);
      ctx.lineWidth = 6;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatar, 50, 40, 140, 140);

      ctx.restore();

      const file = new AttachmentBuilder(canvas.toBuffer(), { name: "level.png" });

      message.channel.send({ files: [file] });
    } else {
      let progress = this.client.utils.progressBar(Math.floor(xpNeeded), Math.floor(xp));

      let embed = new EmbedBuilder()
        .setColor(this.client.embeds.level.color);
      if(this.client.embeds.level.title) embed.setTitle(this.client.embeds.level.title);
      
      if(this.client.embeds.level.description) embed.setDescription(this.client.embeds.level.description.replace("<user>", user.username)
        .replace("<level>", level)
        .replace("<xp>", xp)
        .replace("<xpNeeded>", xpNeeded)
        .replace("<rank>", rank)
        .replace("<progress>", progress[0])
        .replace("<percentage>", Math.round(progress[1])));
      
      let field = this.client.embeds.level.fields;
      for(let i = 0; i < this.client.embeds.level.fields.length; i++) {
        embed.addFields([{ name: field[i].title, value: field[i].description.replace("<user>", user.username)
          .replace("<level>", level)
          .replace("<xp>", xp)
          .replace("<xpNeeded>", xpNeeded)
          .replace("<rank>", rank)
          .replace("<progress>", progress[0])
          .replace("<percentage>", Math.round(progress[1])) }]);
      }
      
      if(this.client.embeds.level.footer == true ) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
      if(this.client.embeds.level.thumbnail == true) embed.setThumbnail(user.displayAvatarURL());

      message.channel.send({ embeds: [embed] });
    }
  }

  async slashRun(interaction, args) {
    let user = interaction.options.getUser("user") || interaction.user;
    if(this.client.config.plugins.leveling.enabled == false) return;

    if(user.bot) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_bot, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.level.ephemeral });

    const userData = await this.client.database.usersData().get(`${user.id}`) || {};
    
    let level = userData.level || 1;
    let xp = userData.xp || 0;
    
    const nextLevel = parseInt(level) + 1;
    const xpNeeded = nextLevel * 2 * 250 + 250;

    let every = (await this.client.database.usersData().all()).sort((a, b) => (b.value?.level ?? b.level) - (a.value?.level ?? a.level));
    let rank = every.map(x => x.id).indexOf(user.id) + 1 || 'N/A';
    
    if(this.client.config.plugins.leveling.rank_style == "CARD") {
      const member = interaction.guild.members.cache.get(user.id);
      let presence = member.presence;
      if(presence == null) presence = "offline";
      else presence = presence.status;

      const formatXP = xp > 1000 ? (xp / 1000).toFixed(2) + "K" : xp;
      const formatXPNeeded = xpNeeded > 1000 ? (xpNeeded / 1000).toFixed(2) + "K" : xpNeeded;
      
      const rankColor = this.client.config.plugins.leveling.card_color_role == true ? member.roles.highest.color.toString(16) : this.client.config.plugins.leveling.card_color_default.replace("#", "");
      
      let color = "#737f8d";
      switch(presence) {
        case 'offline':
          color = "#737f8d"
        break;
        case 'online':
          color = "#3ba55b" 
        break;
        case 'idle':
          color = "#f9a61a"
        break;
        case 'dnd':
          color = "#ec4145"
        break;
      }

      let canvas = Canvas.createCanvas(910, 300);
      let ctx = canvas.getContext('2d');
      
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, 110);
      ctx.fillStyle = `#${rankColor}`;
      ctx.fill();
      ctx.closePath()

      ctx.beginPath();
      ctx.rect(0, 110, canvas.width, 190);
      ctx.fillStyle = "#23272a";
      ctx.fill();
      ctx.closePath();
      
      ctx.fillStyle = "#FFFFFF";

      ctx.lineWidth = 25;
      ctx.beginPath();
      ctx.lineTo(910 - 50, 235)
      ctx.lineTo(910 - 50, 240)
      ctx.lineTo(50, 240)
      ctx.strokeStyle = "#FFFFFF"
      ctx.stroke()
      ctx.closePath();
      ctx.fill()
      ctx.restore();

      ctx.fillStyle = `#${rankColor}`;

      ctx.beginPath();
      if((50 + Math.floor((xp / xpNeeded) * 810)) <= 66) {
        ctx.lineTo(66, 235)
        ctx.lineTo(66, 240)
      } else {
        ctx.lineTo(50 + Math.floor((xp / xpNeeded) * 810), 235)
        ctx.lineTo(50 + Math.floor((xp / xpNeeded) * 810), 240)
      }
      ctx.lineTo(50, 240)
      ctx.strokeStyle = `#${rankColor}`;
      ctx.stroke();
      ctx.closePath();
      ctx.fill()
      ctx.restore();

      ctx.font = "25px Arial";
      ctx.fillStyle = "#f0EDED";
      ctx.fillText(`${formatXP}`, 650, 205);
      let xpWidth = ctx.measureText(`${formatXP}`).width;

      ctx.fillStyle = "#FEFEFE";
      ctx.fillText(`/${formatXPNeeded} XP`, 650 + xpWidth, 205);

      ctx.font = '30px calibri';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${user.username}`, 220, 145);

      ctx.font = '23px calibri';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Rank: #${rank}`, 220, 175);

      ctx.font = '23px calibri';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Level: ${level}`, 220, 200);

      const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: "png" }));
      ctx.beginPath();
      ctx.arc(120, 110, 70, 0, Math.PI * 2, true);
      ctx.lineWidth = 6;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatar, 50, 40, 140, 140);

      ctx.restore();

      const file = new AttachmentBuilder(canvas.toBuffer(), { name: "level.png" });
      
      interaction.reply({ files: [file] });
    } else {
      let progress = this.client.utils.progressBar(Math.floor(xpNeeded), Math.floor(xp));
    
      let embed = new EmbedBuilder()
        .setColor(this.client.embeds.level.color);
      if(this.client.embeds.level.title) embed.setTitle(this.client.embeds.level.title);
      
      if(this.client.embeds.level.description) embed.setDescription(this.client.embeds.level.description.replace("<user>", user.username)
        .replace("<level>", level)
        .replace("<xp>", xp)
        .replace("<xpNeeded>", xpNeeded)
        .replace("<rank>", rank)
        .replace("<progress>", progress[0])
        .replace("<percentage>", Math.round(progress[1])));
      
      let field = this.client.embeds.level.fields;
      for(let i = 0; i < this.client.embeds.level.fields.length; i++) {
        embed.addFields([{ name: field[i].title, value: field[i].description.replace("<user>", user.username)
          .replace("<level>", level)
          .replace("<xp>", xp)
          .replace("<xpNeeded>", xpNeeded)
          .replace("<rank>", rank)
          .replace("<progress>", progress[0])
          .replace("<percentage>", Math.round(progress[1])) }]);
      }
      
      if(this.client.embeds.level.footer == true ) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
      if(this.client.embeds.level.thumbnail == true) embed.setThumbnail(user.displayAvatarURL());
      
      interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.level.ephemeral });
    }
  }
};
