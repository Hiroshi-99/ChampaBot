const Discord = require("discord.js");
const chalk = require("chalk");
const fs = require("fs");
const yaml = require("yaml");
const fetch = require("node-fetch");
const config = yaml.parse(fs.readFileSync('./configs/config.yml', 'utf8'));

function formatTime(ms){
  let roundNumber = ms > 0 ? Math.floor : Math.ceil;
  let days = roundNumber(ms / 86400000),
  hours = roundNumber(ms / 3600000) % 24,
  mins = roundNumber(ms / 60000) % 60,
  secs = roundNumber(ms / 1000) % 60;
  var time = (days > 0) ? `${days}d ` : "";
  time += (hours > 0) ? `${hours}h ` : "";
  time += (mins > 0) ? `${mins}m ` : "";
  time += (secs > 0) ? `${secs}s` : "0s";
  return time;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const updateStats = async(client, guild) => {
  let robots = client.users.cache.filter((u) => u.bot == true).size;
  let allUsers = guild.memberCount;
  let members = guild.memberCount - robots;
  let boostCount = guild.premiumSubscriptionCount;
  let channels = guild.channels.cache.size;
  let roles = guild.roles.cache.size;

  const countersCache = client.dbCache.get("counters");

  let chTotal = countersCache.totalChannel;
  let chMembers = countersCache.membersChannel;
  let chRobots = countersCache.robotsChannel;
  let chChannels = countersCache.channelsChannel;
  let chRoles = countersCache.rolesChannel;
  let chBoosts = countersCache.boostsChannel;
  let chMinecraft = countersCache.minecraftChannel;

  if(chTotal != null && guild.channels.cache.get(chTotal)) {
    let ch = guild.channels.cache.get(chTotal);
    ch.setName(ch.name.replace(/[0-9]/g, "") + allUsers);
  }
  if(chMembers != null && guild.channels.cache.get(chMembers)) {
    let ch = guild.channels.cache.get(chMembers);
    ch.setName(ch.name.replace(/[0-9]/g, "") + members);
  }
  if(chRobots != null && guild.channels.cache.get(chRobots)) {
    let ch = guild.channels.cache.get(chRobots);
    ch.setName(ch.name.replace(/[0-9]/g, "") + robots);
  }
  if(chChannels != null && guild.channels.cache.get(chChannels)) {
    let ch = guild.channels.cache.get(chChannels);
    ch.setName(ch.name.replace(/[0-9]/g, "") + channels);
  }
  if(chRoles != null && guild.channels.cache.get(chRoles)) {
    let ch = guild.channels.cache.get(chRoles);
    ch.setName(ch.name.replace(/[0-9]/g, "") + roles);
  }
  if(chBoosts != null && guild.channels.cache.get(chBoosts)) {
    let ch = guild.channels.cache.get(chBoosts);
    ch.setName(ch.name.replace(/[0-9]/g, "") + boostCount);
  }
  if(chMinecraft != null && guild.channels.cache.get(chMinecraft)) {
    let serverData = await fetch(`https://api.mcsrvstat.us/2/${client.config.general.minecraft_ip}`, {
      method: "GET",
    }).then(async(res) => await res.json());
    let ch = guild.channels.cache.get(chMinecraft);
    ch.setName(client.language.utility.minecraft_counter.replace("<online>", serverData.players.online)
      .replace("<max>", serverData.players.max));
  }
}

function commandsList(client, category) {
  let prefix = client.config.general.prefix; 
  let commands = client.commands.filter(
    c => c.category === category && c.enabled === true
  );
  let loaded = [...commands.values()];
  let content = "";
  
  loaded.forEach(
    c => (content += client.language.general.help_format.replace("<prefix>", prefix)
      .replace("<name>", c.name)
      .replace("<usage>", c.usage)
      .replace("<description>", c.description))
  );
  
  return content.trim();
}

const parseArgs = (args, options) => {
  if (!options) return args

  if (typeof options === 'string') options = [options]

  const optionValues = {}

  let i
  for (i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg.startsWith('-')) break;

    const label = arg.substr(1)

    if (options.indexOf(label + ':') > -1) {
      const leftover = args.slice(i + 1).join(' ')
      const matches = leftover.match(/^"(.+?)"/)
      if (matches) {
        optionValues[label] = matches[1]
        i += matches[0].split(' ').length
      } else {
        i++
        optionValues[label] = args[i]
      }
    } else if (options.indexOf(label) > -1) {
      optionValues[label] = true
    } else {
      break
    }
  }

  return {
    options: optionValues,
    leftover: args.slice(i)
  }
}

const generateInvitesCache = (invitesCache) => {
  const cacheCollection = new Discord.Collection();
  invitesCache.forEach((invite) => {
    cacheCollection.set(invite.code, { code: invite.code, uses: invite.uses, maxUses: invite.maxUses, inviter: invite.inviter });
  });
  return cacheCollection;
};

const sendError = (error) => {
  console.log(chalk.red("[ERROR] ") + chalk.white(error));

  let errorMessage = `[${new Date().toLocaleString()}] [ERROR] ${error}\n`;
  
  fs.appendFile("./errors.txt", errorMessage, (e) => { 
    if(e) console.log(e);
  });
}

const sendWarn = (warn) => {
  console.log(chalk.keyword("orange")("[WARNING] ") + chalk.white(warn));

  let warnMessage = `[${new Date().toLocaleString()}] [WARN] ${warn}\n`;
  
  fs.appendFile("./info.txt", warnMessage, (e) => { 
    if(e) console.log(e);
  });
}

const sendInfo = (info) => {
  console.log(chalk.blue("[INFO] ") + chalk.white(info));
}

const filesCheck = () => {
  if(!fs.existsSync('./info.txt')) {
    fs.open('./info.txt', 'w', function (err, file) {
      if (err) sendError("Couldn't create file (info.txt)");
      sendInfo("File (info.txt) doesn't exists, creating it.");
    });
  }
  if(!fs.existsSync('./errors.txt')) {
    fs.open('./errors.txt', 'w', function(err, file) {
      if(err) sendError("Couldn't create file (errors.txt)");
      sendInfo("File (errors.txt) doesn't exist, creating it.");
    });
  }
  if(!fs.existsSync('./transcripts')) {
    fs.mkdir('./transcripts', function (err) {
      if (err) sendError("Couldn't create folder (transcripts)");
      sendInfo("Folder (transcripts) doesn't exists, creating it.");
    }) 
  }
  if(!fs.existsSync('./addons')) {
    fs.mkdir('./addons', function (err) {
      if (err) sendError("Couldn't create folder (addons)");
      sendInfo("Folder (addons) doesn't exists, creating it.");
    }) 
  }
}

const validUsage = (client, message, validUsage) => {
  let embed = client.embedBuilder(client, message.member.user, client.embeds.title, client.language.general.invalid_usage.replace("<usage>", validUsage), client.embeds.error_color);
  return embed;
}

const hasRole = (client, guild, member, roles, checkEmpty = false) => {
  if(checkEmpty == true && roles.length == 0) return true;

  let arr = roles.map((x, i) => {
    let findPerm = client.utils.findRole(guild, `${x}`.toLowerCase());
    if(!findPerm) return false;
    if(member.roles.cache.has(findPerm.id)) return true;

    return false;
  });
  if(checkEmpty == true && arr.length == 0) return true;

  return arr.includes(true) ? true : false;
}

const permissionsLength = (message, member, permList) => {
  let userPerms = [];
  permList.forEach((perm) => {
    if(!Discord.PermissionFlagsBits[perm]) perm = "";
    if(!message.channel.permissionsFor(member).has(perm)) {
      userPerms.push(perm);
    }
  });

  return userPerms.length;
}

const pushHistory = async(client, userId, text) => {
  await client.database.usersData().unshift(`${userId}.invites.history`, text);
}

const logs = (client, guild, type, fields, user, event = "none") => {
  if(!guild.members.me.permissions.has("ManageGuild")) return;
  if(event == "none") {
    let aChannel = client.utils.findChannel(guild, client.config.plugins.logging.channels?.[event]) || 
      client.utils.findChannel(guild, client.config.channels.logging.bot);
    
    let embed = new Discord.EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`Logging Type - \`${type}\``)
      .setColor("#FFFFFD")
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    if(client.config.plugins.logging.thumbnail == true)
      embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
      
    for(var i = 0; i < fields.length; i++) {
      embed.addFields([{ name: fields[i].name + "", value: fields[i].desc + "" }]);
    }

    if(aChannel) aChannel.send({ embeds: [embed] });
  } else {
    if(!client.config.plugins.logging.events.includes(event) && !client.config.plugins.logging.events.includes("ALL")) return;
    let aChannel = client.utils.findChannel(guild, client.config.plugins.logging.channels?.[event]) || 
      client.utils.findChannel(guild, client.config.channels.logging.events);
    
    let embed = new Discord.EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`Logging Type - \`${type}\``)
      .setColor("#FFFFFD")
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    if(client.config.plugins.logging.thumbnail == true)
      embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
      
    for(var i = 0; i < fields.length; i++) {
      embed.addFields([{ name: fields[i].name + "", value: fields[i].desc + "" }]);
    }
  
    if(aChannel) aChannel.send({ embeds: [embed] });
  }
}

const findChannel = (guild, channel) => {
  return guild.channels.cache.find(ch => ch.name.toLowerCase() == `${channel}`.toLowerCase()) || guild.channels.cache.get(channel);
}

const findRole = (guild, role) => {
  return guild.roles.cache.find(r => r.name.toLowerCase() == `${role}`.toLowerCase()) || guild.roles.cache.get(role);
}

const channelRoleCheck = (client, usedGuild, foundWarn) => {
  const config = client.config;
  if (client.config.roles.bypass.cooldown.length > 0) {
    for (let i = 0; i > client.config.roles.bypass.cooldown.length; i++) {
      let findRole = client.utils.findRole(usedGuild, client.config.roles.bypass.cooldown[i]);
      if (!findRole) {
        client.utils.sendWarn("One or more Cooldown Bypass Roles (roles.bypass.cooldown) provided are invalid or belongs to other Server.");
        foundWarn.push("Invalid Cooldown Bypass Roles");
        break;
      }
    }
  }
  if (client.config.roles.bypass.permission.length > 0) {
    for (let i = 0; i > client.config.roles.bypass.permission.length; i++) {
      let findRole = client.utils.findRole(usedGuild, client.config.roles.bypass.permission[i]);
      if (!findRole) {
        client.utils.sendWarn("One or more Permission Bypass Roles (roles.bypass.permission) provided are invalid or belongs to other Server.");
        foundWarn.push("Invalid Permission Bypass Roles");
        break;
      }
    }
  }
  if(config.channels.sugg_logs != "" && config.general.sugg_decision == true) {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.sugg_logs);
    if(!findChannel) {
      client.utils.sendWarn("Suggestion Logs Channel Name/ID (sugg_logs) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Suggestions Logs Channel");
    }
  }
  if(config.channels.sugg_decision != "" && config.general.sugg_decision == true) {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.sugg_logs);
    if(!findChannel) {
      client.utils.sendWarn("Suggestion Decision Channel Name/ID (sugg_decision) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Suggestions Decision Channel");
    }
  }
  if(config.channels.announce != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.announce);
    if(!findChannel) {
      client.utils.sendWarn("Auto Announcements Channel Name/ID (announce) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Auto Announcements Channel");
    }
  }
  if(config.channels.invites != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.invites);
    if(!findChannel) {
      client.utils.sendWarn("Invites Channel Name/ID (invites) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Invites Channel");
    }
  }
  if(config.channels.welcome != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.welcome);
    if(!findChannel) {
      client.utils.sendWarn("Welcome Channel Name/ID (welcome) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Welcome Channel");
    }
  }
  if(config.channels.leave != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.leave);
    if(!findChannel) {
      client.utils.sendWarn("Leave Channel Name/ID (leave) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Leave Channel");
    }
  }
  if(config.channels.temporary.category != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.temporary.category);
    if(!findChannel) {
      client.utils.sendWarn("Temporary Voice Channel Category Name/ID (temporary.category) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Temporary VC Category");
    }
  }
  if(config.channels.temporary.voice != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.temporary.voice);
    if(!findChannel) {
      client.utils.sendWarn("Temporary Voice Channel Name/ID (temporary.voice) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Temporary Voice Channel");
    }
  }
  if(config.channels.logging.bot != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.logging.bot);
    if(!findChannel) {
      client.utils.sendWarn("Bot Logging Channel Name/ID (decision) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Bot Logging Channel");
    }
  }
  if(config.channels.logging.events != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.logging.events);
    if(!findChannel) {
      client.utils.sendWarn("Events Logging Channel Name/ID (decision) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Events Logging Channel");
    }
  }
  if(config.channels.transcripts != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.transcripts);
    if(!findChannel) {
      client.utils.sendWarn("Transcripts Channel Name/ID (transcripts) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Transcripts Channel");
    }
  }
  if(config.channels.ticket_category != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.ticket_category);
    if(!findChannel) {
      client.utils.sendWarn("Ticket Category Channel Name/ID (ticket_category) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Events Ticket Category Channel");
    }
  }
}

const progressBar = (max, curr) => {
  let line = '□'
  let slider = '■';
  let length = 25;
  if (curr > max) {
    const bar = slider.repeat(length + 2);
    const percentage = (curr / max) * 100;
    return [bar, percentage];
  } else {
    const percentage = curr / max;
    const progress = Math.round((length * percentage));
    const emptyProgress = length - progress;
    const progressText = slider.repeat(progress);
    const emptyProgressText = line.repeat(emptyProgress);
    const bar = progressText + emptyProgressText;
    const calculated = percentage * 100;
    return [bar, calculated];
  }
}

const isIgnored = (guild, ch, channels) => {
  let ignoredChannels = channels.map((x, i) => {
    let findIgnore = findChannel(guild, x);
    if(findIgnore) return findIgnore.id;
    return undefined;
  });
  return ignoredChannels.includes(ch.id);
}

function giveawayObject(guild, messageId, time, channel, winners, messages, invites, ending, hoster, prize) {
  let gwObject = {
    id: messageId,
    guild: guild, 
    channel: channel,
    prize: prize,
    duration: time, 
    hostedBy: hoster, 
    winnerCount: winners, 
    requirements: {
      messagesReq: messages, 
      invitesReq: invites,
    },
    ended: false, 
    endsAt: ending,
    winners: []
  }
  
  return gwObject;
}

const updateSuggestionEmbed = async (client, interaction) => {
  let suggData = await client.database.suggestionsData().get(`${interaction.message.id}`);
  let suggChannel = client.utils.findChannel(interaction.guild, client.config.channels.suggestions);
  let decisionChannel = client.utils.findChannel(interaction.guild, client.config.channels.sugg_decision);

  let suggMenu = new Discord.EmbedBuilder()
    .setColor(client.embeds.suggestion.color);

  if(client.embeds.suggestion.title) suggMenu.setTitle(client.embeds.suggestion.title);
  let field = client.embeds.suggestion.fields;
  for (let i = 0; i < client.embeds.suggestion.fields.length; i++) {
    suggMenu.addFields([{ name: field[i].title, value: field[i].description.replace("<author>", suggData.author.username)
      .replace("<suggestion>", suggData.text)
      .replace("<yes_vote>", suggData.yes)
      .replace("<no_vote>", suggData.no)
      .replace("<date>", suggData.date) }])
  }

  if(client.embeds.suggestion.footer == true) suggMenu.setFooter({ text: suggData.author.username, iconURL: suggData.author.avatar }).setTimestamp();
  if(client.embeds.suggestion.thumbnail == true) suggMenu.setThumbnail(interaction.guild.iconURL());

  if(client.embeds.suggestion.description) suggMenu.setDescription(client.embeds.suggestion.description.replace("<author>", `<@!${suggData.author.id}>`)
    .replace("<suggestion>", suggData.text)
    .replace("<yes_vote>", suggData.yes)
    .replace("<no_vote>", suggData.no)
    .replace("<date>", suggData.date));

  let suggRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setLabel(client.language.buttons.yes_vote.replace("<count>", suggData.yes))
      .setEmoji(client.config.emojis.yes_emoji || {})
      .setCustomId("vote_yes")
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setLabel(client.language.buttons.no_vote.replace("<count>", suggData.no))
      .setEmoji(client.config.emojis.no_emoji || {})
      .setCustomId("vote_no")
      .setStyle(Discord.ButtonStyle.Danger),
    new Discord.ButtonBuilder()
      .setLabel(client.language.buttons.remove_vote)
      .setEmoji(client.config.emojis.remove_vote || {})
      .setCustomId("vote_reset")
      .setStyle(Discord.ButtonStyle.Secondary)
  );

  let decisionRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
    .setCustomId("decision_menu")
    .setPlaceholder(client.language.general.suggestions.placeholder)
    .addOptions([{
      label: client.language.general.suggestions.decision.accept,
      value: "decision_accept",
      emoji: client.config.emojis.yes_emoji
      }, {
      label: client.language.general.suggestions.decision.deny,
      value: "decision_deny",
      emoji: client.config.emojis.no_emoji
      }, {
      label: client.language.general.suggestions.decision.delete,
      value: "decision_delete",
      emoji: client.config.emojis.remove_vote
      }])
  );

  let suggMessage = await suggChannel.messages.fetch({ message: interaction.message.id });
  await suggMessage.edit({ embeds: [suggMenu], components: [suggRow] });
  if(client.config.channels.sugg_decision && client.config.general.sugg_decision) {
    let decisionMessage = await decisionChannel.messages.fetch({ message: suggData.decision });
    if(decisionMessage) await decisionMessage.edit({ embeds: [suggMenu], components: [decisionRow] });
  }
}

const antiCapsFilter = (c) => {
  let length = c.replace(/[^A-Z]/g, "").length;
  let percent = Math.floor((length / c.length) * 100);
  if (c.length < 8) return false;
  return percent > 65;
}

const pushInf = async(client, userId, text) => {
  await client.database.usersData().unshift(`${userId}.infractions`, text);
}

const unbanChecker = async(client, guild) => {
  let bans = (await client.database.usersData().all()).map((x) => {
    return {
      id: x.id,
      endsAt: x.value?.tempBan?.endsAt ?? x.tempBan?.endsAt
    }
  });
  
  bans.forEach((ban) => {
    setInterval(async() => {
      if(ban.endsAt && ban.endsAt < Date.now()) {
        await guild.bans.remove(bannedUser).catch((err) => { });
        await client.database.usersData().delete(`${ban.id}.endsAt`);
      }
    }, 180_000);
  })
}

const serverLogs = async(client, object) => {
  if(config.server.dashboard.save_logs == true) {
    let serverLogs = await client.database.guildData().get(`${client.config.general.guild}.serverLogs`) || [];
    if(serverLogs.length >= 120) {
      serverLogs = serverLogs.slice(0, 120);
      await client.database.guildData().set(`${client.config.general.guild}.serverLogs`, serverLogs);
    }
  
    await client.database.guildData().push(`${client.config.general.guild}.serverLogs`, object);
  }
}

const dashboardLogs = async(client, object) => {
  if(config.server.dashboard.save_logs == true) {
    let dashboardLogs = await client.database.guildData().get(`${client.config.general.guild}.dashboardLogs`) || [];
    if(dashboardLogs.length >= 120) {
      dashboardLogs = dashboardLogs.slice(0, 120);
      await client.database.guildData().set(`${client.config.general.guild}.dashboardLogs`, dashboardLogs);
    }
  
    await client.database.guildData().push(`${client.config.general.guild}.dashboardLogs`, object);
  }
}

const dashboardFormat = (text) => {
  if(!text) text = "";
  return text.replaceAll(/\*{2}(.*?)\*{2}/g, '<span class="fw-bold">$1</span>');
}

const ticketUsername = (user) => {
  const regex = /[^a-z0-9]+/g
  const format = user.username.toLowerCase().replace(regex, "");
  return format == "" ? `${user.id}` : format;
}

const ticketPlaceholders = (string, user, ticket) => {
  if(ticket < 10) ticket = "000" + ticket;
  else if(ticket >= 10 && ticket < 100) ticket = "00" + ticket
  else if(ticket >= 100 && ticket < 1000) ticket = "0" + ticket
  else if(ticket >= 1000) ticket = ticket;

  return string.toLowerCase().replace("<username>", ticketUsername(user)).replace("<ticket>", ticket);
}

const databaseChecks = async(client, guildData) => {
  sendInfo("Doing some database tasks, this is usual and will take few seconds, don't worry.");

  //== Update Cache of Channels for Counters ==//
  client.dbCache.set('counters', {
    totalChannel: guildData?.counters?.totalChannel,
    membersChannel: guildData?.counters?.membersChannel,
    robotsChannel: guildData?.counters?.robotsChannel,
    channelsChannel: guildData?.counters?.channelsChannel,
    rolesChannel: guildData?.counters?.rolesChannel,
    boostsChannel: guildData?.counters?.boostsChannel,
    minecraftChannel: guildData?.counters?.minecraftChannel
  });

  const allTickets = (await client.database.ticketsData().all());
  allTickets.forEach(async(x) => {
    if(!client.channels.cache.get(x.id))
      await client.database.ticketsData().delete(x.id);
  });

  //== Remove Tickets from User if there is no channel ==//
  const allUsers = (await client.database.usersData().all());
  allUsers.forEach(async(usr) => {
    const usrId = usr.id;
    
    usr = usr.value ?? usr;
    if(usr?.tickets && usr?.tickets?.length > 0) {
      usr.tickets.forEach(async(u) => {
        const channel = await client.channels.cache.get(u.channel);
        if(!channel) {
          let newTickets = usr.tickets.filter((x) => x.channel != u.channel);
          await client.database.usersData().set(`${usrId}.tickets`, newTickets);
        }
      });
    }
  });

  //== Remove Temporary Channels from DB if Channel is deleted ==//
  const allTemporary = await client.database.guildData().get(`${client.config.general.guild}.temporaryChannels`) || [];
  allTemporary.forEach(async(temp) => {
    if(!client.channels.cache.get(temp))
      await client.database.guildData().unshift(`${client.config.general.guild}.temporaryChannels`, temp);
  });
}

const createTranscript = async(client, message, channel) => {
  let ticketData = await client.database.ticketsData().get(`${channel.id}`);
  let randomIdCase = Math.floor(Math.random() * 1000);

  const ticketPath = `transcripts/ticket-${ticketData?.ticketId || randomIdCase}.txt`;

  let write = fs.createWriteStream(ticketPath);
  await channel.messages.fetch({ limit: 100 }).then(async(messages) => {
    let messages2 = messages;
    let me = messages2.sort((b, a) => b.createdTimestamp - a.createdTimestamp);

    me.forEach((msg) => {
      const time = msg.createdAt.toLocaleString("en-GB");
      
      if(msg.content) msg.content = msg.content.replaceAll(/<@[!]?\d{18}>/g, (user) => message.guild.members.cache.get(user.match(/\d+/) ? user.match(/\d+/)[0] : '')?.user.username || 'invalid-user')
        .replaceAll(/<@&\d{18}>/g, (role) => message.guild.roles.cache.get(role.match(/\d+/) ? role.match(/\d+/)[0] : '')?.name || 'deleted-role')
        .replaceAll(/<#\d{18}>/g, (ch) => message.guild.channels.cache.get(ch.match(/\d+/) ? ch.match(/\d+/)[0] : '')?.name || 'deleted-channel');

      if(msg.embeds[0]?.data?.description) {
        if(msg.content.length > 0)
          msg.content = msg.content += " | [EMBED DESCRIPTION]: " + msg.embeds[0].data.description.replaceAll(/<@[!]?\d{18}>/g, (user) => message.guild.members.cache.get(user.match(/\d+/) ? user.match(/\d+/)[0] : '')?.user.username || 'invalid-user')
            .replaceAll(/<@&\d{18}>/g, (role) => message.guild.roles.cache.get(role.match(/\d+/) ? role.match(/\d+/)[0] : '')?.name || 'deleted-role')
            .replaceAll(/<#\d{18}>/g, (ch) => message.guild.channels.cache.get(ch.match(/\d+/) ? ch.match(/\d+/)[0] : '')?.name || 'deleted-channel');
        else msg.content = "[EMBED DESCRIPTION]: " + msg.embeds[0].data.description.replaceAll(/<@[!]?\d{18}>/g, (user) => message.guild.members.cache.get(user.match(/\d+/) ? user.match(/\d+/)[0] : '')?.user.username || 'invalid-user')
        .replaceAll(/<@&\d{18}>/g, (role) => message.guild.roles.cache.get(role.match(/\d+/) ? role.match(/\d+/)[0] : '')?.name || 'deleted-role')
        .replaceAll(/<#\d{18}>/g, (ch) => message.guild.channels.cache.get(ch.match(/\d+/) ? ch.match(/\d+/)[0] : '')?.name || 'deleted-channel');
      }
      
      write.write(`[${time}] ${msg.author.username}: ${msg.content}\n`);
    });
    write.end();
    const transcriptChannel = await message.guild.channels.cache.get(client.config.channels.transcripts);
    if(transcriptChannel)
      transcriptChannel.send({ embeds: [client.embedBuilder(client, "", client.embeds.title, client.language.tickets.transcript.replace("<id>", ticketData.ticketId).replace("<author>", `<@!${ticketData.owner}>`), client.embeds.general_color)], files: [ticketPath] });

    const ticketOwner = client.users.cache.get(ticketData.owner);
    if(client.config.general.dm_transcript == true) {
      if(ticketOwner) await ticketOwner.send({ embeds: [client.embedBuilder(client, "", client.embeds.title, client.language.tickets.transcript_dm.replace("<id>", ticketData.ticketId).replace("<author>", `<@!${ticketData.owner}>`), client.embeds.general_color)], files: [ticketPath] }).catch((err) => {});
    }
  });
}

const findEmoji = (emoji) => {
  let emojiName = emoji.split(":");
  emojiName = emojiName.length > 2 ? emojiName[emojiName.length - 1].slice(0, -1) : emojiName[0];

  return emojiName;
}

module.exports = {
  formatTime,
  capitalizeFirstLetter,
  commandsList,
  updateStats,
  sendError, 
  validUsage,
  generateInvitesCache,
  pushHistory,
  logs, 
  findChannel,
  findRole,
  channelRoleCheck,
  giveawayObject,
  progressBar,
  isIgnored,
  hasRole,
  filesCheck,
  sendWarn,
  sendInfo,
  permissionsLength,
  parseArgs,
  updateSuggestionEmbed,
  antiCapsFilter,
  pushInf,
  unbanChecker,
  serverLogs,
  dashboardLogs,
  dashboardFormat,
  ticketPlaceholders,
  databaseChecks,
  createTranscript,
  findEmoji
}
