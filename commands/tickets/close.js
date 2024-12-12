const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const db = new QuickDB();
const { createTranscript } = require("../../utils/utils");

module.exports = class Close extends Command {
	constructor(client) {
		super(client, {
			name: "close",
			description: client.cmdConfig.close.description,
			usage: client.cmdConfig.close.usage,
			permissions: client.cmdConfig.close.permissions,
			aliases: client.cmdConfig.close.aliases,
			category: "tickets",
			enabled: client.cmdConfig.close.enabled,
			slash: true,
		});
	}
  
  async run(message, args) {
    const config = this.client.config;
		const language = this.client.language;

    const ticketData = await this.client.database.ticketsData().get(message.channel.id);
    if (!ticketData) 
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.ticket_channel, this.client.embeds.error_color)] });

    if(this.client.config.general.confirm_close == true) {
      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_yes")
          .setStyle(ButtonStyle.Success)
          .setLabel(this.client.language.buttons.tickets.confirm_yes)
          .setEmoji(this.client.config.emojis.tickets.confirm_yes),
        new ButtonBuilder()
          .setCustomId("confirm_no")
          .setStyle(ButtonStyle.Danger)
          .setLabel(this.client.language.buttons.tickets.confirm_no)
          .setEmoji(this.client.config.emojis.tickets.confirm_no)
      );

      const m = await message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.confirm, this.client.embeds.general_color)], components: [confirmRow], fetchReply: true });

      const filter = (i) => i.user.id == message.author.id && (i.customId == "confirm_yes" || i.customId == "confirm_no");
      const collector = await message.channel.createMessageComponentCollector({ filter, time: this.client.config.general.confirm_time * 1000, componentType: ComponentType.Button });
      collector.on("collect", async(i) => {
        await i.deferUpdate();
        confirmRow.components[0].setStyle(ButtonStyle.Secondary).setDisabled(true);
        confirmRow.components[1].setStyle(ButtonStyle.Secondary).setDisabled(true);

        await m.edit({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.confirm, this.client.embeds.general_color)], components: [confirmRow] })
        if(i.customId == "confirm_yes") {
          collector.stop("claimed");
          await createTranscript(this.client, message, message.channel);
          i.followUp({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.ticket_deleted, this.client.embeds.general_color)] });

          let memberTickets = await this.client.database.usersData().get(`${ticketData?.owner}.tickets`) || [];
          memberTickets = memberTickets.filter((x) => x.channel != message.channel.id);
          await this.client.database.usersData().set(`${ticketData?.owner}.tickets`, memberTickets);
          await this.client.database.ticketsData().delete(message.channel.id);
      
          setTimeout(async() => {
            await message.channel.delete();
          }, config.plugins.tickets.delete_after * 1000);
        } else if(i.customId == "confirm_no") {
          i.followUp({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.confirm_no, this.client.embeds.success_color)] });
        }
      });

      collector.on("end", async(i, reason) => {
        if(reason == "time") {
          i.followUp({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.confirm_expired, this.client.embeds.general_color)] });
        }
      })
    } else {
      await createTranscript(this.client, message, message.channel);
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.tickets.ticket_deleted, this.client.embeds.general_color)] });

      let memberTickets = await this.client.database.usersData().get(`${ticketData?.owner}.tickets`) || [];
      memberTickets = memberTickets.filter((x) => x.channel != message.channel.id);
      await this.client.database.usersData().set(`${ticketData?.owner}.tickets`, memberTickets);
      await this.client.database.ticketsData().delete(message.channel.id);
  
      setTimeout(async() => {
        await message.channel.delete();
      }, config.plugins.tickets.delete_after * 1000);
    }
  }
	async slashRun(interaction, args) {
    const config = this.client.config;
		const language = this.client.language;

    const ticketData = await this.client.database.ticketsData().get(interaction.channel.id);
    if (!ticketData) 
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.ticket_channel, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.close.ephemeral });

    if(this.client.config.general.confirm_close == true) {
      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_yes")
          .setStyle(ButtonStyle.Success)
          .setLabel(this.client.language.buttons.tickets.confirm_yes)
          .setEmoji(this.client.config.emojis.tickets.confirm_yes),
        new ButtonBuilder()
          .setCustomId("confirm_no")
          .setStyle(ButtonStyle.Danger)
          .setLabel(this.client.language.buttons.tickets.confirm_no)
          .setEmoji(this.client.config.emojis.tickets.confirm_no)
      );

      const m = await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.confirm, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.close.ephemeral, components: [confirmRow], fetchReply: true });

      const filter = (i) => i.user.id == interaction.user.id && (i.customId == "confirm_yes" || i.customId == "confirm_no");
      const collector = await interaction.channel.createMessageComponentCollector({ filter, time: this.client.config.general.confirm_time * 1000, componentType: ComponentType.Button });
      collector.on("collect", async(i) => {
        await i.deferUpdate();
        confirmRow.components[0].setStyle(ButtonStyle.Secondary).setDisabled(true);
        confirmRow.components[1].setStyle(ButtonStyle.Secondary).setDisabled(true);

        await m.edit({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.confirm, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.close.ephemeral, components: [confirmRow] })
        if(i.customId == "confirm_yes") {
          collector.stop("claimed");
          await createTranscript(this.client, interaction, interaction.channel);
          i.followUp({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.ticket_deleted, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.close.ephemeral });

          let memberTickets = await this.client.database.usersData().get(`${ticketData?.owner}.tickets`) || [];
          memberTickets = memberTickets.filter((x) => x.channel != interaction.channel.id);
          await this.client.database.usersData().set(`${ticketData?.owner}.tickets`, memberTickets);
          await this.client.database.ticketsData().delete(interaction.channel.id);
      
          setTimeout(async() => {
            await interaction.channel.delete();
          }, config.plugins.tickets.delete_after * 1000);
        } else if(i.customId == "confirm_no") {
          i.followUp({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.confirm_no, this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.close.ephemeral });
        }
      });

      collector.on("end", async(i, reason) => {
        if(reason == "time") {
          interaction.followUp({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.confirm_expired, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.close.ephemeral });
        }
      })
    } else {
      await createTranscript(this.client, interaction, interaction.channel);
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.tickets.ticket_deleted, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.close.ephemeral });

      let memberTickets = await this.client.database.usersData().get(`${ticketData?.owner}.tickets`) || [];
      memberTickets = memberTickets.filter((x) => x.channel != interaction.channel.id);
      await this.client.database.usersData().set(`${ticketData?.owner}.tickets`, memberTickets);
      await this.client.database.ticketsData().delete(interaction.channel.id);
  
      setTimeout(async() => {
        await interaction.channel.delete();
      }, config.plugins.tickets.delete_after * 1000);
    }
	}
};