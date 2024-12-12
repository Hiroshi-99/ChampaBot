const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class AddLevel extends Command {
  constructor(client) {
    super(client, {
      name: "addlevel",
      description: client.cmdConfig.addlevel.description,
      usage: client.cmdConfig.addlevel.usage,
      permissions: client.cmdConfig.addlevel.permissions,
      aliases: client.cmdConfig.addlevel.aliases,
      category: "administration",
      enabled: client.cmdConfig.addlevel.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User to who to add level",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "level",
        description: "Number of levels to add",
        type: Discord.ApplicationCommandOptionType.Integer,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    const level = args[1];

    if(!user || !level || isNaN(level))
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.addlevel.usage)] });

    await this.client.database.usersData().add(`${user.id}.level`, parseInt(level));

    const total = await this.client.database.usersData().get(`${user.id}.level`);
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.level_added.replace("<user>", user.username).replace("<level>", parseInt(level)).replace("<total>", total), this.client.embeds.general_color)] });

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: message.author.id,
      author: message.author.username,
      user_id: user.id,
      user: user.username,
      value: level,
      message: `level_add`
    });
  }
  async slashRun(interaction, args) {
    const user = interaction.options.getUser("user");
    const level = interaction.options.getInteger("level");

    await this.client.database.usersData().add(`${user.id}.level`, parseInt(level));

    const total = await this.client.database.usersData().get(`${user.id}.level`);
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.level_added.replace("<user>", user.username).replace("<level>", parseInt(level)).replace("<total>", total), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.addlevel.ephemeral });
    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: interaction.user.id,
      author: interaction.user.username,
      user_id: user.id,
      user: user.username,
      value: level,
      message: `level_add`
    });
  }
};
