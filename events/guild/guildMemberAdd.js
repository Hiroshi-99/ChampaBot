const Discord = require("discord.js");
const Event = require("../../structures/Events");
const { generateInvitesCache } = require("../../utils/utils.js");
const Canvas = require("canvas");
const { createCaptchaSync } = require("captcha-canvas");
const { writeFileSync } = require('fs');

module.exports = class GuildMemberAdd extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(member) {
	  if(!member.guild.members.me.permissions.has("ManageGuild")) return;

    if(this.client.config.roles.join.enabled == true) {
      for(let i = 0; i < this.client.config.roles.join.list.length; i++) {
        member.roles.add(this.client.utils.findRole(member.guild, this.client.config.roles.join.list[i]));
      }
    }

    await member.guild.invites.fetch().catch(() => {});
    const guildInvites = generateInvitesCache(member.guild.invites.cache);
    const oldGuildInvites = this.client.invites.get(member.guild.id);
    
    this.client.invites.set(member.guild.id, guildInvites);
    const invite = guildInvites.find((inv) => oldGuildInvites.has(inv.code) && inv.uses > oldGuildInvites.get(inv.code).uses) || oldGuildInvites.find((x) => !guildInvites.has(x.code)) || member.guild.vanityURLCode;

    let inviterName, inviterId;
    if(invite) {
      const vanityData = await member.guild.fetchVanityData().catch(() => { });
      if(invite.code == vanityData?.code || invite == member.guild.vanityURLCode) {
        inviterName = "Vanity URL";
        await this.client.database.usersData().set(`${member.id}.invites.inviter`, "Vanity URL");
      } else {
        const inviter = this.client.users.cache.get(invite.inviter.id);
        inviterName = inviter.username;
        inviterId = inviter.id;

        await this.client.database.usersData().set(`${member.id}.invites.inviter`, inviter.id);
        if (inviter.id != member.id) {
          await this.client.database.usersData().add(`${inviter.id}.invites.regular`, 1);
          await this.client.database.usersData().add(`${inviter.id}.invites.joins`, 1);

          const userInvites = await this.client.database.usersData().get(`${inviter.id}.invites`) || {};
          const regularAmount = userInvites.regular;
          const inviterMember = member.guild.members.cache.get(inviter.id);

          this.client.utils.pushHistory(this.client, inviter.id, this.client.language.invites.joinHistory.replace("<user>", member.user.username));

          let invitesRewardsRoles = Object.keys(this.client.config.roles.invite_rewards.list);
          if(this.client.config.roles.invite_rewards.enabled == true && invitesRewardsRoles.length > 0) {
            for(let i = 0; i < Object.keys(this.client.config.roles.invite_rewards.list).length; i++) {
              if(Object.keys(this.client.config.roles.invite_rewards.list)[i] == regularAmount) {
                let rewardIndex = invitesRewardsRoles.indexOf(`${regularAmount}`)
                if(rewardIndex > 0 && this.client.config.roles.invite_rewards.stack == false) {
                  await inviterMember.roles.remove(this.client.utils.findRole(member.guild, Object.values(this.client.config.roles.invite_rewards.list)[rewardIndex - 1])).catch((err) => {});
                }
                return await inviterMember.roles.add(this.client.utils.findRole(member.guild, Object.values(this.client.config.roles.invite_rewards.list)[i])).catch((err) => {});
              }
            }
          }
        }
      }
    } else {
      inviterName = "Unknown"
      await this.client.database.usersData().delete(`${member.id}.invites.inviter`);
    }

    let invitesChannel = this.client.utils.findChannel(member.guild, this.client.config.channels.invites);

    let msgJoin = this.client.embeds.invites_joined;
    if (invitesChannel && msgJoin && msgJoin != null) {
      const inviterData = await this.client.database.usersData().get(`${inviterId}.invites`) || {};

      let joins = inviterData.joins || 0;
      let regular = inviterData.regular || 0;
      let leaves = inviterData.leaves || 0;

      const joinEmbed = new Discord.EmbedBuilder()
        .setDescription(this.client.embeds.invites_joined.description.replace("<user>", member.user)
          .replace("<members>", member.guild.memberCount)
          .replaceAll("<invitedBy>", inviterName)
          .replace("<leavesInvites>", leaves)
          .replace("<regularInvites>", regular)
          .replace("<joinsInvites>", joins)
          .replace("<createdAt>", member.user.createdAt.toLocaleString()))
        .setColor(this.client.embeds.invites_joined.color);

      if(this.client.embeds.invites_joined.title) joinEmbed.setTitle(this.client.embeds.invites_joined.title
          .replace("<username>", member.user.username));
      if(this.client.embeds.invites_joined.footer) joinEmbed.setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) }).setTimestamp();

      invitesChannel.send({ embeds: [joinEmbed] });
    }

    if(this.client.config.plugins.welcomer.save_roles == true) {
      const savedRoles = await this.client.database.usersData().get(`${member.id}.savedRoles`) || [];
      if(savedRoles.length > 0) {
        member.roles.add(savedRoles);
        await this.client.database.usersData().delete(`${member.id}.savedRoles`);
      }
    }

    if(this.client.config.plugins.welcomer.enabled == true && this.client.config.plugins.welcomer.send_message == true) {
      let wlcmChannel = this.client.utils.findChannel(member.guild, this.client.config.channels.welcome);
      if(this.client.config.plugins.welcomer.type == "EMBED") {
        if(wlcmChannel && this.client.embeds.welcome.description) {
          let wlcmEmbed = new Discord.EmbedBuilder()
            .setDescription(this.client.embeds.welcome.description.replace("<user>", member)
              .replace("<members>", member.guild.memberCount)
              .replace("<createdAt>", member.user.createdAt.toLocaleString())
              .replaceAll("<invitedBy>", inviterName))
            .setColor(this.client.embeds.welcome.color);
    
          if(this.client.embeds.welcome.title) wlcmEmbed.setTitle(this.client.embeds.welcome.title
            .replace("<user>", member.user.username));
          if(this.client.embeds.welcome.thumbnail) wlcmEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
          if(this.client.embeds.welcome.footer) wlcmEmbed.setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) }).setTimestamp();
    
          wlcmChannel.send({ embeds: [wlcmEmbed] });
        }
      } else if(this.client.config.plugins.welcomer.type == "TEXT") {
        wlcmChannel.send({ content: this.client.config.plugins.welcomer.message.replace("<user>", member)
          .replace("<members>", member.guild.memberCount)
          .replace("<createdAt>", member.user.createdAt.toLocaleString())
          .replaceAll("<invitedBy>", inviterName) });
      } else if(this.client.config.plugins.welcomer.type == "CARD") {
        const cardConfig = this.client.config.plugins.welcomer.card;

        const canvas = Canvas.createCanvas(700, 310);
        const ctx = canvas.getContext('2d');
      
        const background = await Canvas.loadImage(`./data/${cardConfig.file}`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        if(cardConfig.style == "LEFT") {
          ctx.font = "bold 36px Arial";
          ctx.fillStyle = cardConfig.color_title.replace("<username>", member.user.username.length >= 28 ? member.user.username.slice(0, 24) + ".." : member.user.username)
            .replace("<tag>", member.user.username)
            .replace("<memberCount>", member.guild.memberCount);
          ctx.fillText(cardConfig.lines.title, 238, 140);
  
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

        const welcomeImage = new Discord.AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.jpg' });

        wlcmChannel.send({ files: [welcomeImage] });
      }
    }

    if(this.client.config.plugins.verification.enabled == true) {
      if(this.client.config.plugins.verification.type == "EMBED") {
        const randomString  = () => (Math.random() * 466567).toString(36).slice(-7).replace(".", "");
        let realCode = randomString();
  
        let selOptions = [];
        let emojis = ["1️⃣", "2️⃣", "3️⃣"];
        emojis.forEach((e) => {
          let generateWrong = randomString();
          selOptions.push({
            label: generateWrong,
            value: generateWrong,
            emoji: e
          });
        });
  
        let verifyBttn = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.StringSelectMenuBuilder()
              .setCustomId("verify_sel")
              .setPlaceholder(this.client.language.general.verify_placeholder.replace("<code>", realCode))
              .addOptions(selOptions)
          );
  
        let randomReal = Math.floor(Math.random() * 3);
        verifyBttn.components[0].options[randomReal].setValue(realCode);
        verifyBttn.components[0].options[randomReal].setLabel(realCode);
  
        let verifyEmbed = new Discord.EmbedBuilder()
          .setDescription(this.client.embeds.verification.description.replace("<code>", realCode))
          .setColor(this.client.embeds.verification.color);
  
        if(this.client.embeds.verification.title) verifyEmbed.setTitle(this.client.embeds.verification.title
          .replace("<user>", member.user.username));
  
        let verifyChannel = this.client.utils.findChannel(member.guild, this.client.config.plugins.verification.channel);
        let verifyDm = await member.user.send({ embeds: [verifyEmbed], components: [verifyBttn] }).catch((err) => { });
        if(!verifyDm && verifyChannel) return verifyChannel.send({ embeds: [this.client.embedBuilder(this.client, member.user, this.client.language.titles.error, this.client.language.general.dm_closed, this.client.embeds.error_color)] });
        if(!verifyDm) return;
  
        const verifyFilter = (int) => int.customId == "verify_sel" && int.user.id == member.user.id;
        await verifyDm.awaitMessageComponent({ verifyFilter, componentType: Discord.ComponentType.StringSelect, time: this.client.config.plugins.verification.time * 1000 }).then(async(sel) => {
          await sel.deferUpdate();
          if(sel.values[0] != realCode) {
            verifyBttn.components[0].setDisabled(true);
            await verifyDm.edit({ embeds: [verifyEmbed], components: [verifyBttn] });
            verifyEmbed
              .setDescription(this.client.embeds.verification.fail_description.replace("<code>", realCode))
              .setColor(this.client.embeds.error_color);
            if(this.client.embeds.verification.fail_title) verifyEmbed.setTitle(this.client.embeds.verification.fail_title);
    
            await member.user.send({ embeds: [verifyEmbed]});
            return;
          }
          let findAdd = this.client.utils.findRole(member.guild, this.client.config.plugins.verification.role_add);
          if(findAdd) await member.roles.add(findAdd);
          let findRemove = this.client.utils.findRole(member.guild, this.client.config.plugins.verification.role_remove);
          if(findRemove) await member.roles.remove(findRemove);
          
          verifyBttn.components[0].setDisabled(true);
          await verifyDm.edit({ embeds: [verifyEmbed], components: [verifyBttn] });
          verifyEmbed
            .setDescription(this.client.embeds.verification.success_description.replace("<code>", realCode))
            .setColor(this.client.embeds.success_color);
          if(this.client.embeds.verification.fail_title) verifyEmbed.setTitle(this.client.embeds.verification.success_title);
  
          await member.user.send({ embeds: [verifyEmbed] });
        }).catch(async(err) => {
          verifyBttn.components[0].setDisabled(true);
          await verifyDm.edit({ embeds: [verifyEmbed], components: [verifyBttn] });
          verifyEmbed
            .setDescription(this.client.embeds.verification.fail_description.replace("<code>", realCode))
            .setColor(this.client.embeds.error_color);
          if(this.client.embeds.verification.fail_title) verifyEmbed.setTitle(this.client.embeds.verification.fail_title);
  
          await member.user.send({ embeds: [verifyEmbed]});
          return;
        });
      } else if(this.client.config.plugins.verification.type == "IMAGE") {
        const { image, text } = createCaptchaSync(300, 100);

        let verifyEmbed = new Discord.EmbedBuilder()
          .setDescription(this.client.embeds.verification.description_captcha)
          .setColor(this.client.embeds.verification.color);
  
        if(this.client.embeds.verification.title) verifyEmbed.setTitle(this.client.embeds.verification.title
          .replace("<user>", member.user.username));

        const captchaAtt = new Discord.AttachmentBuilder(image, { name: "captcha.png" });

        verifyEmbed.setImage("attachment://captcha.png");

        writeFileSync('./data/captcha.png', image); 

        const userDM = await member.user.createDM();

        let verifyChannel = this.client.utils.findChannel(member.guild, this.client.config.plugins.verification.channel);
        let verifyDm = await userDM.send({ embeds: [verifyEmbed], files: [captchaAtt] }).catch((err) => { });
        if(!verifyDm && verifyChannel) return verifyChannel.send({ embeds: [this.client.embedBuilder(this.client, member.user, this.client.language.titles.error, this.client.language.general.dm_closed, this.client.embeds.error_color)] });
        if(!verifyDm) return;

        const filter = (m) => m.content == text && m.author.id == member.id;
        await userDM.awaitMessages({ filter, max: 1, time: this.client.config.plugins.verification.time * 1000, errors: ['time'] }).then(async(msg) => {
          let findAdd = this.client.utils.findRole(member.guild, this.client.config.plugins.verification.role_add);
          if(findAdd) await member.roles.add(findAdd);
          let findRemove = this.client.utils.findRole(member.guild, this.client.config.plugins.verification.role_remove);
          if(findRemove) await member.roles.remove(findRemove);
          
          verifyEmbed
            .setDescription(this.client.embeds.verification.success_description)
            .setColor(this.client.embeds.success_color);
          if(this.client.embeds.verification.fail_title) verifyEmbed.setTitle(this.client.embeds.verification.success_title);
  
          await member.user.send({ embeds: [verifyEmbed] });
        }).catch(async(err) => {
          verifyEmbed
            .setDescription(this.client.embeds.verification.fail_description)
            .setColor(this.client.embeds.error_color);
          if(this.client.embeds.verification.fail_title) verifyEmbed.setTitle(this.client.embeds.verification.fail_title);
  
          await member.user.send({ embeds: [verifyEmbed]});
          return;
        })
      }
    }
 	}
};
