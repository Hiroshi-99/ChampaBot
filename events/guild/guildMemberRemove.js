const Event = require("../../structures/Events");
const Discord = require("discord.js");
const Canvas = require("canvas");

module.exports = class GuildMemberRemove extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(member) {
	  let config = this.client.config;
    const userInvites = await this.client.database.usersData().get(`${member.id}.invites`) || {};
    const inviter = userInvites.inviter;
    const inviterData = await this.client.database.usersData().get(`${inviter}.invites`) || {};
    if(inviter != member.id && inviter != "Unknown" && inviter != "Vanity URL" && inviter) {
      await this.client.database.usersData().add(`${inviter}.invites.leaves`, 1);
      await this.client.database.usersData().sub(`${inviter}.invites.regular`, 1);
      this.client.utils.pushHistory(this.client, inviter, this.client.language.invites.leaveHistory.replace("<user>", member.user.username));
    }
    let invitesChannel = this.client.utils.findChannel(member.guild, this.client.config.channels.invites);

    if (invitesChannel) {
      let inviterName;

      if(inviter == "Vanity URL") inviterName = "Vanity URL";
      else if(inviter == undefined  || inviter == null || inviter == "Unknown") inviterName = "Unknown";
      else inviterName = this.client.users.cache.get(inviter).username;
      
      let joins = inviterData.joins || 0;
      let leaves = (inviterData.leaves + 1) || 0;
      let regular = (inviterData.regular - 1) || 0;
      let msgLeave = this.client.embeds.invites_left;
      
      if(msgLeave && msgLeave != null) {
        const leaveEmbed = new Discord.EmbedBuilder()
          .setDescription(this.client.embeds.invites_left.description.replace("<user>", member.user)
            .replace("<members>", member.guild.memberCount)
            .replaceAll("<invitedBy>", inviterName)
            .replace("<leavesInvites>", leaves)
            .replace("<regularInvites>", regular)
            .replace("<joinsInvites>", joins)
            .replace("<createdAt>", member.user.createdAt.toLocaleString()))
          .setColor(this.client.embeds.invites_left.color);

        if(this.client.embeds.invites_left.title) leaveEmbed.setTitle(this.client.embeds.invites_left.title
          .replace("<username>", member.user.username));
        if(this.client.embeds.invites_left.footer) leaveEmbed.setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) }).setTimestamp();;

        invitesChannel.send({ embeds: [leaveEmbed] });
      }
    }

    if(this.client.config.plugins.welcomer.save_roles == true)
      await this.client.database.usersData().set(`${member.id}.savedRoles`, member.roles.cache.map((r) => r.id));
    
    if(this.client.config.plugins.leave.enabled == true && this.client.config.plugins.leave.send_message == true) {
      let leaveChannel = this.client.utils.findChannel(member.guild, this.client.config.channels.leave);
      if(this.client.config.plugins.leave.type == "EMBED") {
        if(leaveChannel && this.client.embeds.leave.description) {
          let inviterName = inviter != "Unknown" && inviter != "Vanity URL" ? this.client.users.cache.get(inviter)?.username : inviter;
          let leaveEmbed = new Discord.EmbedBuilder()
            .setDescription(this.client.embeds.leave.description.replace("<user>", member)
              .replace("<members>", member.guild.memberCount)
              .replace("<createdAt>", member.user.createdAt.toLocaleString())
              .replaceAll("<invitedBy>", inviterName))
            .setColor(this.client.embeds.leave.color);
        
          if(this.client.embeds.leave.title) leaveEmbed.setTitle(this.client.embeds.leave.title.replace("<user>", member.user.username));
          if(this.client.embeds.leave.thumbnail) leaveEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
          if(this.client.embeds.leave.footer) leaveEmbed.setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) }).setTimestamp();
        
          leaveChannel.send({ embeds: [leaveEmbed] });
        }
      } else if(this.client.config.plugins.leave.type == "TEXT") {
        let inviterName = inviter != "Unknown" && inviter != "Vanity URL" ? this.client.users.cache.get(inviter)?.username : inviter;
        leaveChannel.send({ content: this.client.config.plugins.leave.message.replace("<user>", member)
          .replace("<members>", member.guild.memberCount)
          .replace("<createdAt>", member.user.createdAt.toLocaleString())
          .replaceAll("<invitedBy>", inviterName) });
      } else if(this.client.config.plugins.leave.type == "CARD") {
        const cardConfig = this.client.config.plugins.leave.card;

        const canvas = Canvas.createCanvas(700, 310);
        const ctx = canvas.getContext('2d');
      
        const background = await Canvas.loadImage(`./data/${cardConfig.file}`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        if(cardConfig.style == "LEFT") {
          ctx.font = "bold 36px Arial";
          ctx.fillStyle = cardConfig.color_title
          ctx.fillText(cardConfig.lines.title.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount), 238, 140);
  
          ctx.font = "22px Arial";
          ctx.fillStyle = cardConfig.color;
          ctx.fillText(cardConfig.lines.first_line.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount), 238, 170);
  
          ctx.font = "22px Arial";
          ctx.fillStyle = cardConfig.color;
          ctx.fillText(cardConfig.lines.second_line.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount), 238, 195);
  
          ctx.font = "22px Arial";
          ctx.fillStyle = cardConfig.color;
          ctx.fillText(cardConfig.lines.third_line.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount), 238, 220);
  
          ctx.beginPath();
          ctx.arc(135, 155, 70, 0, Math.PI * 2, true);
          ctx.lineWidth = 4;
          ctx.strokeStyle = "white";
          ctx.stroke();
          ctx.closePath();
          ctx.clip();
  
          const avatar = await Canvas.loadImage(member.user.displayAvatarURL({
            extension: 'png'
          }));
          ctx.drawImage(avatar, 60, 80, 150, 150);
        } else if(cardConfig.style == "CENTER") {
          ctx.textAlign = 'center';
          ctx.font = "bold 36px Arial";
          ctx.fillStyle = cardConfig.color_title;
          ctx.fillText(cardConfig.lines.title.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount), canvas.width/2, 220);

          ctx.font = "22px Arial";
          ctx.fillStyle = cardConfig.color;
          ctx.fillText(cardConfig.lines.first_line.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount), canvas.width/2, 250);

          ctx.font = "22px Arial";
          ctx.fillStyle = cardConfig.color;
          ctx.fillText(cardConfig.lines.second_line.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount), canvas.width/2, 275);

          ctx.font = "22px Arial";
          ctx.fillStyle = cardConfig.color;
          ctx.fillText(cardConfig.lines.third_line.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount), canvas.width/2, 300);

          ctx.beginPath();
          ctx.arc(350, 115, 70, 0, Math.PI * 2, true);
          ctx.lineWidth = 4;
          ctx.strokeStyle = "white";
          ctx.stroke();
          ctx.closePath();
          ctx.clip();

          const avatar = await Canvas.loadImage(member.user.displayAvatarURL({
            extension: 'png'
          }));
          ctx.drawImage(avatar, canvas.width/2-75, canvas.height/2-110, 150, 150);
        }

        const leaveImage = new Discord.AttachmentBuilder(canvas.toBuffer(), { name: 'leave.jpg' });

        leaveChannel.send({ files: [leaveImage] });
      }
    }
	}
};
