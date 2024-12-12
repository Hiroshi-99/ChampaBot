const Command = require("../../structures/Command");

const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = class Add extends Command {
  constructor(client) {
    super(client, {
      name: "add",
      description: client.cmdConfig.add.description,
      usage: client.cmdConfig.add.usage,
      permissions: client.cmdConfig.add.permissions,
      aliases: client.cmdConfig.add.aliases,
      category: "tickets",
      enabled: client.cmdConfig.add.enabled,
      slash: true,
      options: [
        {
          name: "user",
          type: ApplicationCommandOptionType.User,
          description: "User to add to Ticket",
          required: true,
        },
      ],
    });
  }

  async run(message, args) {
    let config = this.client.config;

    const ticketData = await this.client.database
      .ticketsData()
      .get(message.channel.id);
    if (!ticketData)
      return message.channel.send({
        embeds: [
          this.client.embedBuilder(
            this.client,
            message.author,
            this.client.embeds.title,
            this.client.language.tickets.ticket_channel,
            this.client.embeds.error_color
          ),
        ],
      });
    let member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!member)
      return message.channel.send({
        embeds: [
          this.client.utils.validUsage(
            this.client,
            message,
            this.client.cmdConfig.add.usage
          ),
        ],
      });

    message.guild.channels.cache
      .get(message.channel.id)
      .permissionOverwrites.create(member.id, {
        ViewChannel: true,
        SendMessages: true,
      });

    const added = new EmbedBuilder()
      .setTitle(this.client.embeds.title)
      .setDescription(
        this.client.language.tickets.user_added.replace(
          "<user>",
          member.user.username
        )
      )
      .setFooter({
        text: this.client.embeds.footer,
        iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp()
      .setColor(this.client.embeds.success_color);

    message.channel.send({ embeds: [added] });
  }
  async slashRun(interaction, args) {
    let config = this.client.config;
    let member = interaction.options.getUser("user");

    const ticketData = await this.client.database
      .ticketsData()
      .get(interaction.channel.id);
    if (!ticketData)
      return interaction.reply({
        embeds: [
          this.client.embedBuilder(
            this.client,
            interaction.user,
            this.client.embeds.title,
            this.client.language.tickets.ticket_channel,
            this.client.embeds.error_color
          ),
        ],
        ephemeral: this.client.cmdConfig.add.ephemeral,
      });

    interaction.guild.channels.cache
      .get(interaction.channel.id)
      .permissionOverwrites.create(member.id, {
        ViewChannel: true,
        SendMessages: true,
      });

    const added = new EmbedBuilder()
      .setTitle(this.client.embeds.title)
      .setDescription(
        this.client.language.tickets.user_added.replace(
          "<user>",
          member.user.username
        )
      )
      .setFooter({
        text: this.client.embeds.footer,
        iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp()
      .setColor(this.client.embeds.success_color);

    interaction.reply({
      embeds: [added],
      ephemeral: this.client.cmdConfig.add.ephemeral,
    });
  }
};
