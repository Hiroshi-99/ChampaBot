const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class ReactionRoles extends Command {
  constructor(client) {
    super(client, {
      name: "reactionroles",
      description: client.cmdConfig.reactionroles.description,
      usage: client.cmdConfig.reactionroles.usage,
      permissions: client.cmdConfig.reactionroles.permissions,
      aliases: client.cmdConfig.reactionroles.aliases,
      category: "administration",
      enabled: client.cmdConfig.reactionroles.enabled,
      slash: true,
      options: [{
        name: "id",
        type: Discord.ApplicationCommandOptionType.String,
        description: "ID of Reaction Role to Create",
        required: true,
      }]
    });
  }

  async run(message, args) {
    let config = this.client.config;
    let id = args.join(" ");

    if(!args[0]) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.reactionroles.usage)] });

    let findMenu = this.client.config.plugins.reaction_roles.list.find((r) => r.id.includes(id));
    if(!findMenu) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.reaction_roles.invalid_category, this.client.embeds.error_color)] });

    if(findMenu.type == "TEXT") {
      await message.channel.send({ content: findMenu.description }).then(async(msg) => {
        await this.client.database.guildData().push(`${this.client.config.general.guild}.reactionRoles`, {
          id: findMenu.id,
          message: msg.id
        });
        Object.keys(findMenu.roles).forEach(async(r) => {
          await msg.react(Object.keys(findMenu.roles[r])[0]);
        })
      });
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.reaction_roles.created.replace("<category>", this.client.utils.capitalizeFirstLetter(findMenu.id)), this.client.embeds.success_color)] });
    } else if(findMenu.type == "EMBED") {
      let embed = new Discord.EmbedBuilder()
        .setDescription(findMenu.description)
        .setColor(findMenu.color);

      if(findMenu.title) embed.setTitle(findMenu.title);

      await message.channel.send({ embeds: [embed] }).then(async(msg) => {
        await this.client.database.guildData().push(`${this.client.config.general.guild}.reactionRoles`, {
          id: findMenu.id,
          message: msg.id
        });
        Object.keys(findMenu.roles).forEach(async(r) => {
          await msg.react(Object.keys(findMenu.roles[r])[0]);
        });
      });
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.reaction_roles.created.replace("<category>", this.client.utils.capitalizeFirstLetter(findMenu.id)), this.client.embeds.success_color)] });
    } else if(findMenu.type == "MESSAGE") {
      let fetchedMessage = await message.channel.messages.fetch(findMenu.message).catch((err) => { });
      if(!fetchedMessage)
        return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.reaction_roles.invalid_message, this.client.embeds.error_color)] });

      await this.client.database.guildData().push(`${this.client.config.general.guild}.reactionRoles`, {
        id: findMenu.id,
        message: findMenu.message
      });
      Object.keys(findMenu.roles).forEach(async(r) => {
        await fetchedMessage.react(Object.keys(findMenu.roles[r])[0]);
      });

      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.reaction_roles.created.replace("<category>", this.client.utils.capitalizeFirstLetter(findMenu.id)), this.client.embeds.success_color)] });
    } else {
      this.client.utils.sendError("Invalid Message Type for Reaction Role Message Provided.");
    }
  }
  async slashRun(interaction, args) {
    let config = this.client.config;

    let id = interaction.options.getString("id");

    let findMenu = this.client.config.plugins.reaction_roles.list.find((r) => r.id.includes(id));
    if(!findMenu) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.reaction_roles.invalid_category, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.reactionroles.ephemeral });
    
    if(findMenu.type == "TEXT") {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.reaction_roles.created.replace("<category>", this.client.utils.capitalizeFirstLetter(findMenu.id)), this.client.embeds.success_color)] });
      await interaction.followUp({ content: findMenu.description }).then(async(msg) => {
        await this.client.database.guildData().push(`${this.client.config.general.guild}.reactionRoles`, {
          id: findMenu.id,
          message: msg.id
        });
        Object.keys(findMenu.roles).forEach(async(r) => {
          await msg.react(Object.keys(findMenu.roles[r])[0]);
        })
      });
    } else if(findMenu.type == "EMBED") {
      let embed = new Discord.EmbedBuilder()
        .setDescription(findMenu.description)
        .setColor(findMenu.color);
    
      if(findMenu.title) embed.setTitle(findMenu.title);
    
      await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.reaction_roles.created.replace("<category>", this.client.utils.capitalizeFirstLetter(findMenu.id)), this.client.embeds.success_color)] });
      await interaction.channel.send({ embeds: [embed] }).then(async(msg) => {
        await this.client.database.guildData().push(`${this.client.config.general.guild}.reactionRoles`, {
          id: findMenu.id,
          message: msg.id
        });
        Object.keys(findMenu.roles).forEach(async(r) => {
          await msg.react(Object.keys(findMenu.roles[r])[0]);
        })
      });
    } else if(findMenu.type == "MESSAGE") {
      let fetchedMessage = await interaction.channel.messages.fetch(findMenu.message).catch((err) => { });
      if(!fetchedMessage)
        return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.reaction_roles.invalid_message, this.client.embeds.error_color)] });

      await this.client.database.guildData().push(`${this.client.config.general.guild}.reactionRoles`, {
        id: findMenu.id,
        message: findMenu.message
      });
      Object.keys(findMenu.roles).forEach(async(r) => {
        await fetchedMessage.react(Object.keys(findMenu.roles[r])[0]);
      });

      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.reaction_roles.created.replace("<category>", this.client.utils.capitalizeFirstLetter(findMenu.id)), this.client.embeds.success_color)] });
    }  else {
      this.client.utils.sendError("Invalid Message Type for Reaction Role Message Provided.");
    }
  }
};
