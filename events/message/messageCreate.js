const Discord = require("discord.js");
const Event = require("../../structures/Events");
const levelingManager = require("../../managers/levelingManager");
const { antiSwear, antiLinks, antiInvites, antiCaps, antiSpam } = require("../../utils/autoMod.js");
const cooldownList = [];

module.exports = class Message extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(message) {
    if (message.channel.type === Discord.ChannelType.DM) return;
    let prefix = this.client.config.general.prefix;

    if (message.author.bot) return;

    await antiSwear(this.client, message);
    await antiLinks(this.client, message);
    await antiInvites(this.client, message);
    await antiCaps(this.client, message);
    await antiSpam(this.client, message);

    if(this.client.config.plugins.anti_tag.enabled == true && ((message.type != Discord.MessageType.Reply) || (message.type == Discord.MessageType.Reply && this.client.config.plugins.anti_tag.ignore_reply == false))) {
      if(!this.client.utils.hasRole(this.client, message.guild, message.member, this.client.config.roles.bypass.anti_tag) && !message.member.permissions.has("ManageGuild")) {
        const userMentionable = this.client.config.plugins.anti_tag.users.map((x) => this.client.users.cache.get(x));
        const roleMentionable = this.client.config.plugins.anti_tag.roles.map((x) => this.client.utils.findRole(message.guild, x));
        const allMentionables = userMentionable.concat(roleMentionable);
  
        if(allMentionables.some((x) => message.mentions.roles.has(x.id) || message.mentions.users.has(x.id))) {
          const findMention = allMentionables.find((x) => message.mentions.roles.has(x.id) || message.mentions.users.has(x.id));
  
          await message.delete();
          if(this.client.config.plugins.anti_tag.warning_message)
            return message.channel.send({ content: this.client.config.plugins.anti_tag.warning_message.replace("<user>", message.author).replace("<mention>", findMention), allowedMentions: { users: [message.author.id] } }).then((msg) => setTimeout(() => msg.delete(), 4000))
        }
      }
    }

    if(this.client.config.plugins.stats.messages == true) 
      await this.client.database.usersData().add(`${message.author.id}.messages`, 1);

    if(this.client.config.auto_response.enabled == true) {
      if((Object.keys(this.client.config.auto_response.list).some(w => message.content.toLowerCase().includes(w.toLowerCase()) || message.content.toLowerCase().startsWith(w.toLowerCase()))) &&
        !this.client.autoResponse.get(message.channel.id)) {
        let rWord = Object.keys(this.client.config.auto_response.list).filter(w => Object.keys(this.client.config.auto_response.list).some(a => message.content.toLowerCase().includes(w.toLowerCase())));
        let respIndex = Object.keys(this.client.config.auto_response.list).indexOf(rWord[0]);
        
        let resp = Object.values(this.client.config.auto_response.list)[respIndex];
        
        this.client.autoResponse.set(message.channel.id, true);
          setTimeout(() => {
            this.client.autoResponse.delete(message.channel.id);
          }, this.client.config.auto_response.cooldown * 1000);
        
        if(this.client.config.auto_response.type == "EMBED") {
          let respEmbed = new Discord.EmbedBuilder()
            .setTitle(this.client.language.titles.auto_response)
            .setColor(this.client.embeds.general_color)
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setDescription(this.client.language.general.auto_response.replace("<user>", message.author)
              .replace("<response>", resp));
            
          message.reply({ embeds: [respEmbed] });
        } else if(this.client.config.auto_response.type == "TEXT") {
          message.reply({ content: resp });
        } else {
          this.client.utils.sendError("Invalid Message Type for Auto Response Message Provided.");
        }
      } 
    }
    
    // <== Commands ==> //
    const prefixMention = new RegExp(`^<@!?${this.client.user.id}> `);

    //=== LEVELING ===//
    if(this.client.config.plugins.leveling.enabled == true) {
      if(!this.client.utils.isIgnored(message.guild, message.channel, this.client.config.channels.ignore.levels)) {
        await levelingManager.manageLeveling(this.client, message);
      };
    }

    const countingChannel = this.client.utils.findChannel(message.guild, this.client.config.channels.games.counting);
    if(message.channel.id == countingChannel?.id) {
      let numberNext = await this.client.database.guildData().get(`${this.client.config.general.guild}.games.counting`) || { number: 0, user: 0 };
      if(numberNext.user === message.author.id || message.content != numberNext.number) 
        return message.delete();
      let updatedEntry = { number: parseInt(numberNext.number + 1), user: message.author.id };

      await this.client.database.guildData().set(`${this.client.config.general.guild}.games.counting`, updatedEntry);

      let nextNum = updatedEntry.number;
      message.channel.setTopic(this.client.language.games.counting_topic.replace("<next>", nextNum));
    }

    //== Commands ==//
    if (message.content.indexOf(prefix) != 0 && !message.content.match(prefixMention)) {
      if(this.client.config.plugins.economy.messages.money_per_message > 0 && this.client.config.plugins.economy.enabled == true) {
        if(!this.client.coinsCooldown.has(message.author.id)) {
          this.client.coinsCooldown.add(message.author.id);
          setTimeout(() => {
            this.client.coinsCooldown.delete(message.author.id);
          }, this.client.config.plugins.economy.messages.cooldown * 1000);

          await this.client.database.usersData().add(`${message.author.id}.money`, this.client.config.plugins.economy.messages.money_per_message);
        }
      }
      return;
    }
  
    prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : this.client.config.general.prefix;
  
    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g);
    const command = args.shift().toLowerCase();
    
    let cmd = this.client.commands.get(command);
    if (!cmd) cmd = this.client.commands.get(this.client.aliases.get(command));
    if(!cmd) return;

    if(this.client.utils.permissionsLength(message, message.member, cmd.permissions) > 0 &&
      !this.client.utils.hasRole(this.client, message.guild, message.member, this.client.config.roles.bypass.permission) &&
      !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.no_perm, this.client.embeds.error_color)] });

    if(this.client.cmdConfig[cmd.name]) {
      let cmdConfig = this.client.cmdConfig[cmd.name];
      if(cmdConfig.enabled == false) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.cmd_disabled, this.client.embeds.error_color)] });
      if(cmd.category == "economy" && this.client.config.plugins.economy.enabled == false) return;
      if(cmd.category == "tickets" && this.client.config.plugins.tickets.enabled == false) return;
      if(cmdConfig && cmdConfig.roles.length > 0 && 
        !this.client.utils.hasRole(this.client, message.guild, message.member, this.client.config.roles.bypass.permission) &&
        !message.member.permissions.has("Administrator")) {
        let cmdRoles = cmdConfig.roles.map((x) => this.client.utils.findRole(message.guild, x));
        if(!this.client.utils.hasRole(this.client, message.guild, message.member, cmdConfig.roles)) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.no_role.replace("<role>", cmdRoles.join(", ").trim()), this.client.embeds.error_color)] });
      }

      let findCooldown = cooldownList.find((c) => c.name == cmd.name && c.id == message.author.id);
      if(!this.client.utils.hasRole(this.client, message.guild, message.member, this.client.config.roles.bypass.cooldown, false) && !message.member.permissions.has("Administrator")) {
        if(findCooldown) {
          let time = this.client.utils.formatTime(findCooldown.expiring - Date.now());
          return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.cooldown.replace("<cooldown>", time), this.client.embeds.error_color)] });
        } else if(!findCooldown && this.client.cmdConfig[cmd.name].cooldown > 0) {
          let cooldown = {
            id: message.author.id,
            name: cmd.name,
            expiring: Date.now() + (this.client.cmdConfig[cmd.name].cooldown * 1000),
          };
  
          cooldownList.push(cooldown);
  
          setTimeout(() => {
            cooldownList.splice(cooldownList.indexOf(cooldown), 1);
          }, this.client.cmdConfig[cmd.name].cooldown * 1000);
        }
      }
    }

    cmd.run(message, args).then(() => {
      if(this.client.config.general.remove_command == true) message.delete();
    });
	}
};
