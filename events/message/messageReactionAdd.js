const Discord = require("discord.js");
const Event = require("../../structures/Events");

module.exports = class MessageReactionAdd extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(reaction, user) {
    if(user.bot) return;
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();
    if(user.partial) await user.fetch();
    const message = reaction.message;
    if(message.channel.type === Discord.ChannelType.DM) return;
    const member = message.guild.members.cache.get(user.id);
    
    if(this.client.config.plugins.reaction_roles.enabled == true) {
      let data = await this.client.database.guildData().get(`${message.guild.id}.reactionRoles`) || [];
      data = data.find((d) => d.message == message.id);
      if(data) {
        let findReaction = this.client.config.plugins.reaction_roles.list.find((r) => r.id == data.id) || undefined;
        if(findReaction) {
          for(let i = 0; i < Object.keys(findReaction.roles).length; i++) {
            let emojiData = this.client.utils.findEmoji(Object.keys(findReaction.roles[i])[0]);
            if((emojiData == reaction.emoji.id || emojiData == reaction.emoji.name) && data.message == reaction.message.id) {
              return await member.roles.add(Object.values(findReaction.roles[i])[0]).catch((err) => {});
            }
          }
        }
      }
    }

    let customEmoji = this.client.config.emojis.giveaway.react;
    let emojiData = this.client.utils.findEmoji(customEmoji);
    
    if(reaction.emoji.name == emojiData || reaction.emoji.id == emojiData) {
      let gwData = await this.client.database.gwData().get(`${message.id}`);
    
      if(!gwData || gwData?.ended == true) return;
      
      const userData = await this.client.database.usersData().get(`${user.id}`) || {};
      let regularInvites = userData.invites?.regular || 0;
      let bonusInvites = userData.invites?.bonus || 0; 
      let msgCount = userData.messages || 0;
      let gwInvitesReq = gwData.requirements.invitesReq;
      let gwMessagesReq = gwData.requirements.messagesReq; 
      let totalInvites = parseInt(regularInvites + bonusInvites);
      let bypassRole = this.client.config.roles.bypass.giveaway.map((x) => {
        let findRole = this.client.utils.findRole(message.guild, x);
        if(findRole) return findRole;
      });
      let blacklistRole = this.client.config.roles.blacklist.giveaway.map((x) => {
        let findRole = this.client.utils.findRole(message.guild, x);
        if(findRole) return findRole;
      });
    
      let denyEmbed = new Discord.EmbedBuilder()
        .setTitle(`${this.client.language.giveaway.titles.entry}`)
        .setColor("Red")
        .setThumbnail(this.client.user.displayAvatarURL());
      let approveEmbed = new Discord.EmbedBuilder()
        .setTitle(`${this.client.language.giveaway.titles.entry}`)
        .setColor("Yellow")
        .setThumbnail(this.client.user.displayAvatarURL())
        .setDescription(`${this.client.language.giveaway.entry_approved.replace("<guild>", message.guild.name).replace("<prize>", gwData.prize)}`);

      if(message.id != gwData.id) return;
      if(bypassRole.length > 0 && bypassRole.some((x) => member.roles.cache.has(x))) return user.send({ embeds: [approveEmbed] });

      let haveInvites = true;
      let haveMessages = true;

      if(blacklistRole.length > 0 && blacklistRole.some((x) => member.roles.cache.has(x))) {
        denyEmbed.setDescription(`${this.client.language.giveaway.entry_denied.replace("<guild>", message.guild.name).replace("<prize>", gwData.prize)}
${this.client.language.giveaway.blacklisted}`);
        reaction.users.remove(user);
        user.send({ embeds: [denyEmbed] });
      }
      if(gwInvitesReq > 0 && totalInvites < gwInvitesReq) {
        denyEmbed.setDescription(`${this.client.language.giveaway.entry_denied.replace("<guild>", message.guild.name).replace("<prize>", gwData.prize)}
${this.client.language.giveaway.not_meet}
${this.client.language.giveaway.embed.invites.replace("<invites>", gwData.requirements.invitesReq)}`);
        reaction.users.remove(user);
        haveInvites = false;
        user.send({ embeds: [denyEmbed] });
      }
      if(haveInvites == true && gwMessagesReq > 0 && msgCount < gwMessagesReq) {
        denyEmbed.setDescription(`${this.client.language.giveaway.entry_denied.replace("<guild>", message.guild.name).replace("<prize>", gwData.prize)}
${this.client.language.giveaway.not_meet}
${this.client.language.giveaway.embed.messages.replace("<messages>", gwData.requirements.messagesReq)}`);
        reaction.users.remove(user);
        haveMessages = false;
        user.send({ embeds: [denyEmbed] });
      }
      if(haveInvites == true && haveMessages == true) {
        approveEmbed.setDescription(`${this.client.language.giveaway.entry_approved.replace("<guild>", message.guild.name).replace("<prize>", gwData.prize)}`);
        approveEmbed.setColor("Yellow")
        user.send({ embeds: [approveEmbed] });
      }
    }

    if (reaction.emoji.name !== "⭐") return;

    const r = await reaction.message.reactions.resolve("⭐");

    const channel = this.client.utils.findChannel(message.guild, this.client.config.channels.starboard);
    if(!channel) return this.client.utils.sendError("No Starboard Channel provided in Config");
    const fetchedMessages = await channel.messages.fetch({ limit: 100 });
    const stars = fetchedMessages.find(m => m.embeds[0] && m.embeds[0]?.footer?.text?.endsWith?.(message.id));
    if (stars) {
      const foundStar = stars.embeds[0];
      const msg = await message.fetch();
      const star = /([0-9]{1,3})/.exec(stars.embeds[0].author.name);
      const image = message.attachments.size > 0 ? await extension(reaction, [...message.attachments.values()][0].url) : msg.content.match(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i) ? msg.content.match(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i)[0] : "";
      const desc = foundStar.description ? foundStar.description : " ";
      const starEmbed = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.general_color)
        .setAuthor({ name: this.client.language.general.starboard.author.replace("<user>", message.author.username)
          .replace("<stars>", `${parseInt(star[1]) + 1}`), iconURL: message.author.displayAvatarURL({ size: 1024, dynamic: true }) }) 
        .setDescription(`${desc}`)
        .setTimestamp()
        .setFooter({ text: this.client.language.general.starboard.footer + `${message.id}` });
      if(image) image.setImage(image);
      const starMsg = await channel.messages.cache.find(s => s.id == stars.id);
      await starMsg.edit({ embeds: [starEmbed] });
    }
    if (!stars) {
      let starCount = this.client.config.plugins.general.starboard;
      if (r.count < starCount) return;
      const msg = await message.fetch();
      const image = message.attachments.size > 0 ? await extension(reaction, [...message.attachments.values()][0].url) : msg.content.match(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i) ? msg.content.match(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i)[0] : "";
      if (image === "" && message.cleanContent.length < 1) return;
      const desc = message.cleanContent ? message.cleanContent : " ";
      const embed = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.general_color)
        .setAuthor({ name: this.client.language.general.starboard.author.replace("<user>", message.author.username)
          .replace("<stars>", `${r.count}`), iconURL: message.author.displayAvatarURL({ size: 1024, dynamic: true }) }) 
        .setDescription(this.client.language.general.starboard.description.replace("<message>", `${message.cleanContent}`)
          .replace("<link>", `${message.url}`))
        .setTimestamp(new Date())
        .setFooter({ text: this.client.language.general.starboard.footer + `${message.id}` });
      if(image) embed.setImage(image)
      await channel.send({ embeds: [embed] });
    }
    async function extension(reaction, attachment) {
      const imageLink = attachment.split(".");
      const typeOfImage = imageLink[imageLink.length - 1];
      const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
      if (!image) return "";
      return attachment;
    }
	}
};
