const Command = require("../../structures/Command");
const { EmbedBuilder, ActionRowBuilder, ComponentType, StringSelectMenuBuilder, ApplicationCommandOptionType } = require('discord.js');
const ms = require('ms');


module.exports = class GiveawayEdit extends Command {
  constructor(client) {
    super(client, {
      name: "gedit",
      description: client.cmdConfig.gedit.description,
      usage: client.cmdConfig.gedit.usage,
      permissions: client.cmdConfig.gedit.permissions,
      aliases: client.cmdConfig.gedit.aliases, 
      category: "giveaway",
      enabled: client.cmdConfig.gedit.enabled,
      slash: true,
      options: [{
        name: 'msgid',
        type: ApplicationCommandOptionType.String,
        description: 'Message ID of Giveaway',
        required: true,
      }]
    });
  }

  async run(message, args) {
    let messageID = args[0];
    if (!messageID) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, "You haven't entered Message ID.", this.client.embeds.error_color)] });

    let gwData = await this.client.database.gwData().get(`${messageID}`);
    
    if(!gwData || gwData?.ended == true) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    const editRow = new ActionRowBuilder()
	    .addComponents(
	      new StringSelectMenuBuilder()
	        .setCustomId("edit_select")
	        .setPlaceholder("Select Option you want to Edit.")
	        .addOptions([{
              label: "Messages Requirement",
              value: "msg_req", 
              emoji: "💬"
            }, {
              label: "Invites Requirement",
              value: "inv_req", 
              emoji: "🎫"
            }, {
              label: "Number of Winners",
              value: "winners",
              emoji: "👑"
            }, {
              label: "Extra Time",
              value: "extra_time",
              emoji: "⌚"
            }, {
              label: "Prize",
              value: "prize",
              emoji: "🎁"
            }, {
              label: "Finish",
              value: "finish",
              emoji: "✔"
            }
          ]),
	    );

    let mainEmbed = new EmbedBuilder()
      .setTitle("🎁・Giveaway")
      .setDescription(`Choose Option to edit from Select Menu.`)
      .setColor(this.client.embeds.general_color);

    let msg = await message.channel.send({ embeds: [mainEmbed], components: [editRow] });

    let filter = (i) => i.customId == "edit_select" && i.user.id == message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 180000 });

    collector.on("collect", async(i) => {
      if(i.values[0] == "msg_req") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.messages);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == message.author.id;
        message.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          if(isNaN(m)) return message.channel.send({ embeds: [ client.embedBuilder(client, message.author, this.client.language.titles.error, this.client.language.giveaway.create.errors.messages, this.client.embeds.error_color)] });
          this.client.gw.editGiveaway(this.client, message, messageID, parseInt(m), 0, 0, 0, 0);
          i.reply({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "inv_req") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.invites);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == message.author.id;
        message.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          if(isNaN(m)) return message.channel.send({ embeds: [ client.embedBuilder(client, message.author, this.client.language.titles.error, this.client.language.giveaway.create.errors.invites, this.client.embeds.error_color)] });
          this.client.gw.editGiveaway(this.client, message, messageID, 0, parseInt(m), 0, 0, 0);
          i.reply({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "winners") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.winners);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == message.author.id;
        message.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          if(isNaN(m)) return message.channel.send({ embeds: [ client.embedBuilder(client, message.author, this.client.language.titles.error, this.client.language.giveaway.create.errors.winners, this.client.embeds.error_color)] });
          this.client.gw.editGiveaway(this.client, message, messageID, "none", "none", parseInt(m), 0, 0);
          i.reply({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "extra_time") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.extra_time);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == message.author.id;
        message.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          this.client.gw.editGiveaway(this.client, message, messageID, "none", "none", 0, m, 0);
          i.reply({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "prize") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.prize);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == message.author.id;
        message.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          if(m.length < 3 || m.length > 32) return message.channel.send({ embeds: [ client.embedBuilder(client, message.author, "Giveaway Setup", this.client.language.giveaway.create.errors.prize, this.client.embeds.error_color)] });
          this.client.gw.editGiveaway(this.client, message, messageID, "none", "none", 0, 0, m);
          i.reply({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "finish") {
        await i.deferUpdate();
        i.reply({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.finish, this.client.embeds.success_color)], ephemeral: true });
        collector.stop("collected");
      }
    });

    collector.on("end", async (collected, reason) => {
      const disabledRow = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("edit_select")
            .setPlaceholder("Select Option you want to Edit.")
            .setDisabled(true)
            .addOptions([{
                label: "Messages Requirement",
                value: "msg_req", 
                emoji: "💬"
              }, {
                label: "Invites Requirement",
                value: "inv_req", 
                emoji: "🎫"
              }, {
                label: "Number of Winners",
                value: "winners",
                emoji: "👑"
              }, {
                label: "Extra Time",
                value: "extra_time",
                emoji: "⌚"
              }, {
                label: "Prize",
                value: "prize",
                emoji: "🎁"
              }
            ]),
        );
      await msg.edit({ embeds: [mainEmbed], components: [disabledRow] });
    });
  }
  async slashRun(interaction, args) {
    let messageID = interaction.options.getString("msgid");
  
    let gwData = await this.client.database.gwData().get(`${messageID}`);
    
    if(!gwData || gwData?.ended == true) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });
  
    const editRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("edit_select")
          .setPlaceholder("Select Option you want to Edit.")
          .addOptions([{
            label: "Messages Requirement",
            value: "msg_req", 
            emoji: "💬"
          }, {
            label: "Invites Requirement",
            value: "inv_req", 
            emoji: "🎫"
          }, {
            label: "Number of Winners",
            value: "winners",
            emoji: "👑"
          }, {
            label: "Extra Time",
            value: "extra_time",
            emoji: "⌚"
          }, {
            label: "Prize",
            value: "prize",
            emoji: "🎁"
          }, {
            label: "Finish",
            value: "finish",
            emoji: "✔"
          }
        ]),
      );
  
    let mainEmbed = new EmbedBuilder()
      .setTitle("🎁・Giveaway")
      .setDescription(`Choose Option to edit from Select Menu.`)
      .setColor(this.client.embeds.general_color);
  
    let msg = await interaction.reply({ embeds: [mainEmbed], components: [editRow] });
  
    let filter = (i) => i.customId == "edit_select" && i.user.id == interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 180000 });
  
    collector.on("collect", async(i) => {
      if(i.values[0] == "msg_req") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.messages);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == interaction.user.id;
        interaction.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          if(isNaN(m)) return interaction.followUp({ embeds: [ this.client.embedBuilder(client, interaction.user, this.client.language.titles.error, this.client.language.giveaway.create.errors.messages, this.client.embeds.error_color)] });
          this.client.gw.editGiveaway(this.client, interaction, messageID, parseInt(m), "none", 0, 0, 0);
          interaction.followUp({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "inv_req") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.invites);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == interaction.user.id;
        interaction.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          if(isNaN(m)) return interaction.followUp({ embeds: [ this.client.embedBuilder(client, interaction.user, this.client.language.titles.error, this.client.language.giveaway.create.errors.invites, this.client.embeds.error_color)] });
          this.client.gw.editGiveaway(this.client, interaction, messageID, "none", parseInt(m), 0, 0, 0);
          interaction.followUp({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "winners") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.winners);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == interaction.user.id;
        interaction.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          if(isNaN(m)) return interaction.followUp({ embeds: [ this.client.embedBuilder(client, interaction.user, this.client.language.titles.error, this.client.language.giveaway.create.errors.winners, this.client.embeds.error_color)] });
          this.client.gw.editGiveaway(this.client, interaction, messageID, "none", "none", parseInt(m), 0, 0);
          interaction.followUp({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "extra_time") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.extra_time);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == interaction.user.id;
        interaction.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          this.client.gw.editGiveaway(this.client, interaction, messageID, "none", "none", 0, m, 0);
          interaction.followUp({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "prize") {
        await i.deferUpdate();
        mainEmbed.setDescription(this.client.language.giveaway.create.prize);
        await msg.edit({ embeds: [mainEmbed], components: [editRow] });
        let eFilter = m => m.author.id == interaction.user.id;
        interaction.channel.awaitMessages({ eFilter, max: 1, time: 30000, errors: ["time"]}).then(async (c) => {
          let m = c.first();
          m = m.content;
          if(m.length < 3 || m.length > 32) return interaction.followUp({ embeds: [ this.client.embedBuilder(client, interaction.user, "Giveaway Setup", this.client.language.giveaway.create.errors.prize, this.client.embeds.error_color)] });
          this.client.gw.editGiveaway(this.client, interaction, messageID, "none", "none", 0, 0, m);
          interaction.followUp({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.done, this.client.embeds.success_color)], ephemeral: true });
        });
      } else if(i.values[0] == "finish") {
        await i.deferUpdate();
        interaction.followUp({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.edit, this.client.language.giveaway.edit.finish, this.client.embeds.success_color)], ephemeral: true });
        collector.stop("collected");
      }
    });
    collector.on("end", async (collected, reason) => {
      const disabledRow = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("edit_select")
            .setPlaceholder("Select Option you want to Edit.")
            .setDisabled(true)
            .addOptions([{
              label: "Messages Requirement",
              value: "msg_req", 
              emoji: "💬"
            }, {
              label: "Invites Requirement",
              value: "inv_req", 
              emoji: "🎫"
            }, {
              label: "Number of Winners",
              value: "winners",
              emoji: "👑"
            }, {
              label: "Extra Time",
              value: "extra_time",
              emoji: "⌚"
            }, {
              label: "Prize",
              value: "prize",
              emoji: "🎁"
            }
          ]),
        );
      await msg.edit({ embeds: [mainEmbed], components: [disabledRow] });
    });
  }
};
