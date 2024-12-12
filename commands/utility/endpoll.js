const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class EndPoll extends Command {
  constructor(client) {
    super(client, {
      name: "End Poll",
      type: Discord.ApplicationCommandType.Message,
      permissions: client.cmdConfig.endpoll.permissions,
      category: "utility",
      enabled: client.cmdConfig.endpoll.enabled,
      slash: true,
      context: true,
    });
  }

  async run(message, args) { }
  async slashRun(interaction, args) {

    const fetchMessage = await interaction.channel.messages.fetch(interaction.targetId).catch((err) => { });

    if(!fetchMessage || !fetchMessage.poll) 
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.invalid_poll, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.endpoll.ephemeral });

    await fetchMessage.poll.end();

    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.poll_ended, this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.endpoll.ephemeral });
  }
};
