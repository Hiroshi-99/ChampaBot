const Command = require("../../structures/Command");
const Discord = require("discord.js");

const fetch = require("node-fetch");

module.exports = class Counters extends Command {
  constructor(client) {
    super(client, {
      name: "counters",
      description: client.cmdConfig.counters.description,
      usage: client.cmdConfig.counters.usage,
      permissions: client.cmdConfig.counters.permissions,
      aliases: client.cmdConfig.counters.aliases,
      category: "utility",
      enabled: client.cmdConfig.counters.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let config = this.client.config;
    let allUsers = message.guild.memberCount;
    let robots = this.client.users.cache.filter((u) => u.bot == true).size;
    let members = message.guild.memberCount - robots;
    let boostCount = message.guild.premiumSubscriptionCount;
    let channels = message.guild.channels.cache.size;
    let roles = message.guild.roles.cache.size;
    let serverData = await fetch(`https://api.mcsrvstat.us/2/${config.general.minecraft_ip}`, {
      method: "GET",
    }).then(async(res) => await res.json());

    let m = await message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.counters_started, this.client.embeds.general_color)] });

    let chCategory = await message.guild.channels.create({
      name: this.client.language.utility.counters_category,
      type: Discord.ChannelType.GuildCategory,
    });
    
    if(config.general.stats_type != "GUILD_VOICE" && config.general.stats_type != "GUILD_TEXT") return this.client.utils.sendError("Provided Channel Type for Counters (stats_type) is invalid. Valid types: GUILD_VOICE, GUILD_TEXT.")

    let chTotal = await message.guild.channels.create({
      name: `${this.client.language.utility.total_counter.replace("<stats>", allUsers)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chMembers = await message.guild.channels.create({
      name: `${this.client.language.utility.members_counter.replace("<stats>", members)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chRobots = await message.guild.channels.create({
      name: `${this.client.language.utility.robots_counter.replace("<stats>", robots)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chChannels = await message.guild.channels.create({
      name: `${this.client.language.utility.channels_counter.replace("<stats>", channels)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chRoles = await message.guild.channels.create({
      name: `${this.client.language.utility.roles_counter.replace("<stats>", roles)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chBoosts = await message.guild.channels.create({
      name: `${this.client.language.utility.boosts_counter.replace("<stats>", boostCount)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chMinecraft = await message.guild.channels.create({
      name: `${this.client.language.utility.minecraft_counter.replace("<online>", serverData.players.online).replace("<max>", serverData.players.max)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });

    const countersList = {
      totalChannel: chTotal.id,
      membersChannel: chMembers.id,
      robotsChannel: chRobots.id,
      channelsChannel: chChannels.id,
      rolesChannel: chRoles.id,
      boostsChannel: chBoosts.id,
      minecraftChannel: chMinecraft.id
    }

    this.client.dbCache.set('counters', countersList);
  
    await this.client.database.guildData().set(`${this.client.config.general.guild}.counters`, countersList);
    
    await m.edit({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.counters_created, this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    let config = this.client.config;
  
    let allUsers = interaction.guild.memberCount;
    let robots = this.client.users.cache.filter((u) => u.bot == true).size;
    let members = interaction.guild.memberCount - robots;
    let boostCount = interaction.guild.premiumSubscriptionCount;
    let channels = interaction.guild.channels.cache.size;
    let roles = interaction.guild.roles.cache.size;
    let serverData = await fetch(`https://api.mcsrvstat.us/2/${config.general.minecraft_ip}`, {
      method: "GET",
    }).then(async(res) => await res.json());

    await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.counters_started, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.counters.ephemeral });
  
    let chCategory = await interaction.guild.channels.create({
      name: this.client.language.utility.counters_category,
      type: Discord.ChannelType.GuildCategory,
    });

    let chTotal = await interaction.guild.channels.create({
      name: `${this.client.language.utility.total_counter.replace("<stats>", allUsers)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chMembers = await interaction.guild.channels.create({
      name: `${this.client.language.utility.members_counter.replace("<stats>", members)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chRobots = await interaction.guild.channels.create({
      name: `${this.client.language.utility.robots_counter.replace("<stats>", robots)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chChannels = await interaction.guild.channels.create({
      name: `${this.client.language.utility.channels_counter.replace("<stats>", channels)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chRoles = await interaction.guild.channels.create({
      name: `${this.client.language.utility.roles_counter.replace("<stats>", roles)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chBoosts = await interaction.guild.channels.create({
      name: `${this.client.language.utility.boosts_counter.replace("<stats>", boostCount)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chMinecraft = await interaction.guild.channels.create({
      name: `${this.client.language.utility.minecraft_counter.replace("<online>", serverData.players.online).replace("<max>", serverData.players.max)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    
    const countersList = {
      totalChannel: chTotal.id,
      membersChannel: chMembers.id,
      robotsChannel: chRobots.id,
      channelsChannel: chChannels.id,
      rolesChannel: chRoles.id,
      boostsChannel: chBoosts.id,
      minecraftChannel: chMinecraft.id
    }

    this.client.dbCache.set('counters', countersList);
  
    await this.client.database.guildData().set(`${this.client.config.general.guild}.counters`, countersList);
  
    await interaction.followUp({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.counters_created, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.counters.ephemeral });
  }
};