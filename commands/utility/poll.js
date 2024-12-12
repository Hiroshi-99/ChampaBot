const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Poll extends Command {
  constructor(client) {
    super(client, {
      name: "poll",
      description: client.cmdConfig.poll.description,
      usage: client.cmdConfig.poll.usage,
      permissions: client.cmdConfig.poll.permissions,
      aliases: client.cmdConfig.poll.aliases,
      category: "utility",
      enabled: client.cmdConfig.poll.enabled,
      slash: true,
      options: [{
        name: "duration",
        description: "Poll duration in hours",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true
      }, {
        name: "question",
        description: "Question you want to ask",
        type: Discord.ApplicationCommandOptionType.String,
        required: true
      }, {
        name: "options",
        description: "Answer options, separate with '|'",
        type: Discord.ApplicationCommandOptionType.String,
        required: true
      }, {
        name: "multi_select",
        description: "Whether to allow multiple votes",
        type: Discord.ApplicationCommandOptionType.Boolean,
        required: false
      }]
    });
  }

  async run(message, args) {
    const duration = args[0];
    const multiSelect = args[1];
    const optionsList = args.slice(2).join(" ")
      .split("|")
      .slice(1)
      .map((s) => s.trim().replace(/\s\s+/g, " ")).filter(Boolean);
    const question = args.slice(2).join(" ").split("|")[0];
      
    if(!question || !duration || (!multiSelect || (multiSelect != false && multiSelect != true)) || !optionsList || optionsList?.length == 0) 
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.poll.usage)] });
      
    const pollData = {
      question: {
        text: question
      },
      answers: optionsList.map((a) => {
        return { text: a }
      }),
      duration,
      allowMultiselect: multiSelect
    };

    message.channel.send({ poll: pollData });
  }
  async slashRun(interaction, args) {
    const duration = interaction.options.getNumber("duration");
    const multiSelect = interaction.options.getBoolean("multi_select") || false;
    const optionsList = interaction.options.getString("options")
      .split("|")
      .map((s) => s.trim().replace(/\s\s+/g, " ")).filter(Boolean);
    const question = interaction.options.getString("question");
      
    if(!question || !optionsList || optionsList?.length == 0) 
      return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, interaction, this.client.cmdConfig.poll.usage)], ephemeral: this.client.cmdConfig.poll.ephemeral });
      
    const pollData = {
      question: {
        text: question
      },
      answers: optionsList.map((answer) => {
        return { text: answer }
      }),
      duration,
      allowMultiselect: multiSelect
    };

    await interaction.reply({ poll: pollData })
  }
};
