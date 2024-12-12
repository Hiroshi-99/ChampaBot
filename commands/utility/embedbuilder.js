const Command = require("../../structures/Command");
const { ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, 
  TextInputStyle, ComponentType, StringSelectMenuBuilder, ChannelType, ButtonStyle, 
  ChannelSelectMenuBuilder, EmbedBuilder } = require("discord.js");

module.exports = class EmbedsBuilder extends Command {
  constructor(client) {
    super(client, {
      name: "embedbuilder",
      description: client.cmdConfig.embedbuilder.description,
      usage: client.cmdConfig.embedbuilder.usage,
      permissions: client.cmdConfig.embedbuilder.permissions,
      aliases: client.cmdConfig.embedbuilder.aliases,
      category: "utility",
      enabled: client.cmdConfig.embedbuilder.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let selectMenuOptions = []
    let optionsList = Object.keys(this.client.language.utility.embed_builder.options).filter((o) => !["cancel", "send", "preview", "channel"].includes(o));

    const api_embed = {
      author: {
        name: '',
        url: '',
        icon_url: ''
      },
      color: 16777200,
      title: '',
      description: 'Lorem ipsum dolor sit amet',
      footer: {
        text: '',
        icon_url: ''
      },
      image: {
        url: ''
      },
      thumbnail: {
        url: ''
      },
      timestamp: 0
    }

    let channelToSend;

    selectMenuOptions = optionsList.map((item) => {
      return {
        label: this.client.language.utility.embed_builder.options[item],
        value: `embedbuilder_${item}`,
        emoji: this.client.config.emojis.embed_builder[item]
      }
    });

    const builderSelectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("embed_builder_select")
        .setPlaceholder(this.client.language.utility.embed_builder.choose_option)
        .addOptions(selectMenuOptions)
    );

    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(this.client.language.utility.embed_builder.options.send)
        .setEmoji(this.client.config.emojis.embed_builder.send || {})
        .setStyle(ButtonStyle.Success)
        .setCustomId("embedbuilder_bttn_send"),
      new ButtonBuilder()
        .setLabel(this.client.language.utility.embed_builder.options.preview)
        .setEmoji(this.client.config.emojis.embed_builder.preview || {})
        .setStyle(ButtonStyle.Primary)
        .setCustomId("embedbuilder_bttn_preview"),
      new ButtonBuilder()
        .setLabel(this.client.language.utility.embed_builder.options.channel)
        .setEmoji(this.client.config.emojis.embed_builder.channel || {})
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("embedbuilder_bttn_channel"),
      new ButtonBuilder()
        .setLabel(this.client.language.utility.embed_builder.options.cancel)
        .setEmoji(this.client.config.emojis.embed_builder.cancel || {})
        .setStyle(ButtonStyle.Danger)
        .setCustomId("embedbuilder_bttn_cancel"),
    )

    let msg = await message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.embed_builder.options_embed, this.client.embeds.general_color)], components: [builderSelectRow, buttonsRow] })

    const filter = (i) => i.user.id == message.author.id && (i.customId == "embed_builder_select" || i.customId.includes("embedbuilder_bttn_"));
    const collector = await message.channel.createMessageComponentCollector({ filter, time: 600_000 });

    collector.on("collect", async(i) => {
      if(i.isStringSelectMenu()) {
        const option = i.values[0];
        for(let j = 0; j < optionsList.length; j++) {
          if(optionsList[j] == option.replace("embedbuilder_", "")) {
            const selectedOption = optionsList[j];
  
          let maxLength = 4000;
          if(selectedOption == "title" || selectedOption == "author_name")
            maxLength = 256;
          else if(selectedOption == "footer_text")
            maxLength = 2048;
  
          const inputModal = new ModalBuilder()
            .setTitle(this.client.language.titles.embed_builder)
            .setCustomId(`embedbuilder_modal_${selectedOption}`)
            .addComponents(new ActionRowBuilder()
              .addComponents(
                new TextInputBuilder()
                  .setCustomId(`embedbuilder_input_${selectedOption}`)
                  .setLabel(this.client.language.utility.embed_builder.options[selectedOption])
                  .setPlaceholder(this.client.language.utility.embed_builder.enter_value)
                  .setRequired(false)
                  .setMaxLength(maxLength)
                  .setStyle(TextInputStyle.Paragraph)
              ));
  
            await i.showModal(inputModal)
            const modalFilter = (int) => int.customId == `embedbuilder_input_${selectedOption}`;
            i.awaitModalSubmit({ modalFilter, time: 120_000 }).then(async(md) => {
              let inputValue = md.fields.getTextInputValue(`embedbuilder_input_${selectedOption}`);
  
              if(selectedOption == "author_name" || selectedOption == "author_img" || selectedOption == "author_url") {
                if(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/.test(inputValue) == false && selectedOption == "author_url")
                  return md.reply({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.embed_builder.invalid_url, this.client.embeds.error_color)], ephemeral: true });
  
                api_embed.author[selectedOption == "author_name" ? "name" : selectedOption == "author_img" ? "icon_url" : "url"] = inputValue;
              }
              else if(selectedOption == "footer_text" || selectedOption == "footer_img")
                api_embed.footer[selectedOption == "footer_text" ? "text" : "icon_url"] = inputValue;
              else if(selectedOption == "image" || selectedOption == "thumbnail")
                api_embed[selectedOption].url = inputValue;
              else if(selectedOption == "timestamp")
                api_embed.timestamp = (inputValue == "" || !inputValue || (new Date(inputValue).toString().includes("Thu Jan 01 1970"))) ? message.createdTimestamp : inputValue;
              else if(selectedOption == "color") {
                if(!inputValue.startsWith("#"))
                  inputValue = "#" + inputValue;
                const convertToDecimal = parseInt(inputValue?.slice(1), 16) || 0;
                api_embed[selectedOption] = convertToDecimal;
              } else api_embed[selectedOption] = inputValue
  
              md.reply({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.embed_builder.option_changed.replace("<value>", inputValue).replace("<option>", selectedOption), this.client.embeds.success_color)], ephemeral: true });
            });
          }
        }
      } else if(i.isButton()) {
        if(i.customId == "embedbuilder_bttn_send") {
          const customEmbed = EmbedBuilder.from(api_embed);
          if(!channelToSend)
            channelToSend = message.channel;
          
          channelToSend.send({ embeds: [customEmbed] });
          i.reply({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.embed_builder.sent.replace("<channel>", channelToSend), this.client.embeds.success_color)], ephemeral: true });
        } else if(i.customId == "embedbuilder_bttn_preview") {
          const customEmbed = EmbedBuilder.from(api_embed);

          i.reply({ content: "**PREVIEW**", embeds: [customEmbed], ephemeral: true });
        }  else if(i.customId == "embedbuilder_bttn_cancel") {
          await i.reply({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.embed_builder.cancel, this.client.embeds.error_color)], ephemeral: true });
          await i.message.delete();
          await collector.stop("canceled");
        } else if(i.customId == "embedbuilder_bttn_channel") {
          const channelSelect = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("embedbuilder_select_channel")
              .setPlaceholder(this.client.language.utility.embed_builder.channel_placeholder)
              .setChannelTypes(ChannelType.GuildText)
          );

          i.reply({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.embed_builder.choose_channel, this.client.embeds.general_color)], components: [channelSelect], ephemeral: true });

          const channelSelectFilter = (i) => i.user.id == message.author.id && i.customId == "embedbuilder_select_channel";
          await message.channel.awaitMessageComponent({ channelSelectFilter, componentType: ComponentType.ChannelSelect, time: 120_000 }).then(async(i) => {
            await i.deferUpdate({ ephemeral: true });
            channelToSend = i.channels.first();
            i.followUp({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.embed_builder.option_changed.replace("<value>", channelToSend.name).replace("<option>", "channel"), this.client.embeds.success_color)], ephemeral: true });
          });
        }
      }
    });

    collector.on("end", async(collected, reason) => {
      if(reason != "time") return;

      await msg.edit({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.embed_builder.options_embed, this.client.embeds.general_color)], 
        components: [new ActionRowBuilder().addComponents(builderSelectRow.components.map((c) => c.setDisabled(true))), new ActionRowBuilder().addComponents(buttonsRow.components.map((c) => c.setStyle(ButtonStyle.Secondary).setDisabled(true)))] });
    });
  }
  async slashRun(interaction, args) {
    let selectMenuOptions = []
    let optionsList = Object.keys(this.client.language.utility.embed_builder.options).filter((o) => !["cancel", "send", "preview", "channel"].includes(o));

    const api_embed = {
      author: {
        name: '',
        url: '',
        icon_url: ''
      },
      color: 16777200,
      title: '',
      description: 'Lorem ipsum dolor sit amet',
      footer: {
        text: '',
        icon_url: ''
      },
      image: {
        url: ''
      },
      thumbnail: {
        url: ''
      },
      timestamp: 0
    }

    let channelToSend;

    selectMenuOptions = optionsList.map((item) => {
      return {
        label: this.client.language.utility.embed_builder.options[item],
        value: `embedbuilder_${item}`,
        emoji: this.client.config.emojis.embed_builder[item]
      }
    });

    const builderSelectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("embed_builder_select")
        .setPlaceholder(this.client.language.utility.embed_builder.choose_option)
        .addOptions(selectMenuOptions)
    );

    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(this.client.language.utility.embed_builder.options.send)
        .setEmoji(this.client.config.emojis.embed_builder.send || {})
        .setStyle(ButtonStyle.Success)
        .setCustomId("embedbuilder_bttn_send"),
      new ButtonBuilder()
        .setLabel(this.client.language.utility.embed_builder.options.preview)
        .setEmoji(this.client.config.emojis.embed_builder.preview || {})
        .setStyle(ButtonStyle.Primary)
        .setCustomId("embedbuilder_bttn_preview"),
      new ButtonBuilder()
        .setLabel(this.client.language.utility.embed_builder.options.channel)
        .setEmoji(this.client.config.emojis.embed_builder.channel || {})
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("embedbuilder_bttn_channel"),
      new ButtonBuilder()
        .setLabel(this.client.language.utility.embed_builder.options.cancel)
        .setEmoji(this.client.config.emojis.embed_builder.cancel || {})
        .setStyle(ButtonStyle.Danger)
        .setCustomId("embedbuilder_bttn_cancel"),
    )

    let msg = await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.embed_builder.options_embed, this.client.embeds.general_color)], components: [builderSelectRow, buttonsRow], fetchReply: true })

    const filter = (i) => i.user.id == interaction.user.id && (i.customId == "embed_builder_select" || i.customId.includes("embedbuilder_bttn_"));
    const collector = await interaction.channel.createMessageComponentCollector({ filter, time: 600_000 });

    collector.on("collect", async(i) => {
      if(i.isStringSelectMenu()) {
        const option = i.values[0];
        for(let j = 0; j < optionsList.length; j++) {
          if(optionsList[j] == option.replace("embedbuilder_", "")) {
            const selectedOption = optionsList[j];
  
          let maxLength = 4000;
          if(selectedOption == "title" || selectedOption == "author_name")
            maxLength = 256;
          else if(selectedOption == "footer_text")
            maxLength = 2048;
  
          const inputModal = new ModalBuilder()
            .setTitle(this.client.language.titles.embed_builder)
            .setCustomId(`embedbuilder_modal_${selectedOption}`)
            .addComponents(new ActionRowBuilder()
              .addComponents(
                new TextInputBuilder()
                  .setCustomId(`embedbuilder_input_${selectedOption}`)
                  .setLabel(this.client.language.utility.embed_builder.options[selectedOption])
                  .setPlaceholder(this.client.language.utility.embed_builder.enter_value)
                  .setRequired(false)
                  .setMaxLength(maxLength)
                  .setStyle(TextInputStyle.Paragraph)
              ));
  
            await i.showModal(inputModal)
            const modalFilter = (int) => int.customId == `embedbuilder_input_${selectedOption}`;
            i.awaitModalSubmit({ modalFilter, time: 120_000 }).then(async(md) => {
              let inputValue = md.fields.getTextInputValue(`embedbuilder_input_${selectedOption}`);
  
              if(selectedOption == "author_name" || selectedOption == "author_img" || selectedOption == "author_url") {
                if(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/.test(inputValue) == false && selectedOption == "author_url")
                  return md.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.embed_builder.invalid_url, this.client.embeds.error_color)], ephemeral: true });
  
                api_embed.author[selectedOption == "author_name" ? "name" : selectedOption == "author_img" ? "icon_url" : "url"] = inputValue;
              }
              else if(selectedOption == "footer_text" || selectedOption == "footer_img")
                api_embed.footer[selectedOption == "footer_text" ? "text" : "icon_url"] = inputValue;
              else if(selectedOption == "image" || selectedOption == "thumbnail")
                api_embed[selectedOption].url = inputValue;
              else if(selectedOption == "timestamp")
                api_embed.timestamp = (inputValue == "" || !inputValue || (new Date(inputValue).toString().includes("Thu Jan 01 1970"))) ? interaction.createdTimestamp : inputValue;
              else if(selectedOption == "color") {
                if(!inputValue.startsWith("#"))
                  inputValue = "#" + inputValue;
                const convertToDecimal = parseInt(inputValue?.slice(1), 16) || 0;
                api_embed[selectedOption] = convertToDecimal;
              } else api_embed[selectedOption] = inputValue
  
              md.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.embed_builder.option_changed.replace("<value>", inputValue).replace("<option>", selectedOption), this.client.embeds.success_color)], ephemeral: true });
            });
          }
        }
      } else if(i.isButton()) {
        if(i.customId == "embedbuilder_bttn_send") {
          const customEmbed = EmbedBuilder.from(api_embed);
          if(!channelToSend)
            channelToSend = interaction.channel;
          
          channelToSend.send({ embeds: [customEmbed] });
          i.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.embed_builder.sent.replace("<channel>", channelToSend), this.client.embeds.success_color)], ephemeral: true });
        } else if(i.customId == "embedbuilder_bttn_preview") {
          const customEmbed = EmbedBuilder.from(api_embed);

          i.reply({ content: "**PREVIEW**", embeds: [customEmbed], ephemeral: true });
        }  else if(i.customId == "embedbuilder_bttn_cancel") {
          await i.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.embed_builder.cancel, this.client.embeds.error_color)], ephemeral: true });
          await i.message.delete();
          await collector.stop("canceled");
        } else if(i.customId == "embedbuilder_bttn_channel") {
          const channelSelect = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("embedbuilder_select_channel")
              .setPlaceholder(this.client.language.utility.embed_builder.channel_placeholder)
              .setChannelTypes(ChannelType.GuildText)
          );

          i.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.embed_builder.choose_channel, this.client.embeds.general_color)], components: [channelSelect], ephemeral: true });

          const channelSelectFilter = (i) => i.user.id == interaction.user.id && i.customId == "embedbuilder_select_channel";
          await interaction.channel.awaitMessageComponent({ channelSelectFilter, componentType: ComponentType.ChannelSelect, time: 120_000 }).then(async(i) => {
            await i.deferUpdate({ ephemeral: true });
            channelToSend = i.channels.first();
            i.followUp({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.embed_builder.option_changed.replace("<value>", channelToSend.name).replace("<option>", "channel"), this.client.embeds.success_color)], ephemeral: true });
          });
        }
      }
    });

    collector.on("end", async(collected, reason) => {
      if(reason != "time") return;

      await msg.edit({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.embed_builder.options_embed, this.client.embeds.general_color)], 
        components: [new ActionRowBuilder().addComponents(builderSelectRow.components.map((c) => c.setDisabled(true))), new ActionRowBuilder().addComponents(buttonsRow.components.map((c) => c.setStyle(ButtonStyle.Secondary).setDisabled(true)))] });
    });
  }
};
