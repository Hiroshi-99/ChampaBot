const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Invites extends Command {
	constructor(client) {
		super(client, {
			name: "invites",
			description: client.cmdConfig.invites.description,
			usage: client.cmdConfig.invites.usage,
			permissions: client.cmdConfig.invites.permissions,
			aliases: client.cmdConfig.invites.aliases,
			category: "member",
			enabled: client.cmdConfig.invites.enabled,
      slash: true,
      options: [{
        name: 'target',
        type: Discord.ApplicationCommandOptionType.User,
        description: "User which Invites to view",
        required: false,
      }]
		});
	}

  async run(message, args) {
    let user = message.mentions.users.first() || this.client.users.cache.get(args[0]) || message.author;
    const userInvites = await this.client.database.usersData().get(`${user.id}.invites`) || {};
  
    let joins = userInvites.joins || 0;
    let left = userInvites.leaves || 0;
    let regular = userInvites.regular || 0;
    let invitedBy = userInvites.inviter;
    let inviter = this.client.users.cache.get(invitedBy);
    inviter = inviter ? inviter.username : 'Unknown User';

    let every = (await this.client.database.usersData().all()).sort((a, b) => (b.value?.invites?.regular ?? b.invites?.regular) - (a.value?.invites?.regular ?? a.invites?.regular))
    let rank = every.map(x => x.id).indexOf(user.id) + 1 || 'N/A';
    
    let history = userInvites.history || ["No History"];
    let contentHistory = String();
    
    for(const inv of history.slice(0, 5)) {
      contentHistory += `\n> ${inv}`
    }
  
    let embed = new Discord.EmbedBuilder()
      .setDescription(this.client.language.invites.invites.replace("<user>", user.username)
        .replace("<joinsInvites>", joins)
        .replace("<leavesInvites>", left)
        .replace("<regularInvites>", regular)
        .replace("<rank>", rank)
        .replace("<history>", contentHistory)
        .replace("<inviter>", inviter))
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor(this.client.embeds.general_color);

    if(this.client.language.titles.invites) embed.setTitle(this.client.language.titles.invites);
  
    message.channel.send({ embeds: [embed] });
  }
  async slashRun(interaction, args) {
    let user = interaction.options.getUser("target") || interaction.user;
    const userInvites = await this.client.database.usersData().get(`${user.id}.invites`) || {};
  
    let joins = userInvites.joins || 0;
    let left = userInvites.leaves || 0;
    let regular = userInvites.regular || 0;
    let invitedBy = userInvites.inviter;
    let inviter = this.client.users.cache.get(invitedBy);
    inviter = inviter ? inviter.username : 'Unknown User';

    let every = (await this.client.database.usersData().all()).sort((a, b) => (b.value?.invites?.regular ?? b.invites?.regular) - (a.value?.invites?.regular ?? a.invites?.regular))
    let rank = every.map(x => x.id).indexOf(user.id) + 1 || 'N/A';
    
    let history = userInvites.history || ["No History"];
    let contentHistory = String();
    
    for(const inv of history.slice(0, 5)) {
      contentHistory += `\n> ${inv}`
    }
  
    let embed = new Discord.EmbedBuilder()
      .setDescription(this.client.language.invites.invites.replace("<user>", user.username)
        .replace("<joinsInvites>", joins)
        .replace("<leavesInvites>", left)
        .replace("<regularInvites>", regular)
        .replace("<rank>", rank)
        .replace("<history>", contentHistory)
        .replace("<inviter>", inviter))
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor(this.client.embeds.general_color);

    if(this.client.language.titles.invites) embed.setTitle(this.client.embeds.title);
  
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.invites.ephemeral });
  }
};
