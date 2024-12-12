const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class AddXP extends Command {
  constructor(client) {
    super(client, {
      name: "addxp",
      description: client.cmdConfig.addxp.description,
      usage: client.cmdConfig.addxp.usage,
      permissions: client.cmdConfig.addxp.permissions,
      aliases: client.cmdConfig.addxp.aliases,
      category: "administration",
      enabled: client.cmdConfig.addxp.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User to who to add xp",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "xp",
        description: "Number of xp to add",
        type: Discord.ApplicationCommandOptionType.Integer,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    const xp = args[1];

    if(!user || !xp || isNaN(xp))
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.addxp.usage)] });

    await this.client.database.usersData().add(`${user.id}.xp`, parseInt(xp));
    const total = await this.client.database.usersData().get(`${user.id}.xp`);
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.xp_added.replace("<user>", user.username).replace("<xp>", parseInt(xp)).replace("<total>", total), this.client.embeds.general_color)] });

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: message.author.id,
      author: message.author.username,
      user_id: user.id,
      user: user.username,
      value: xp,
      message: `xp_add`
    });
  }
  async slashRun(interaction, args) {
    const user = interaction.options.getUser("user");
    const xp = interaction.options.getInteger("xp");

    await this.client.database.usersData().add(`${user.id}.xp`, parseInt(xp));
    const total = await this.client.database.usersData().get(`${user.id}.xp`);
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.xp_added.replace("<user>", user.username).replace("<xp>", parseInt(xp)).replace("<total>", total), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.addxp.ephemeral });

    await this.client.utils.serverLogs(this.client, {
      date: new Date().toLocaleString("en-GB"),
      author_id: interaction.user.id,
      author: interaction.user.username,
      user_id: user.id,
      user: user.username,
      value: xp,
      message: `xp_add`
    });
  }
};
