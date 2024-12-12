const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, InteractionType } = require('discord.js');

module.exports = async (client, array, message, ephemeral = false) => {
  for (const page of array) {
    array[array.indexOf(page)] = (await page);
  }
  let currentPage;
  currentPage = 0;

  const nextBttn = new ButtonBuilder()
    .setEmoji(client.config.emojis.leaderboard.next || {})
    .setLabel(client.language.buttons.leaderboard.next)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(array.length == 0 ? true : false)
    .setCustomId("nextPage");
  const prevBttn = new ButtonBuilder()
    .setEmoji(client.config.emojis.leaderboard.previous || {})
    .setLabel(client.language.buttons.leaderboard.previous)
    .setDisabled(array.length == 0 ? true : false)
    .setStyle(ButtonStyle.Primary)
    .setCustomId("prevPage");

  let row = new ActionRowBuilder()
    .addComponents([prevBttn, nextBttn]);
  
  let msg;
  if(message.type == InteractionType.ApplicationCommand) {
    await message.deferReply({ ephemeral });
    msg = await message.followUp({ embeds: [array[0]], components: [row], ephemeral, fetchReply: true });
  } else {
    msg = await message.channel.send({ embeds: [array[0]], components: [row] });
  }

  const filter = (interaction) => interaction.user.id == message.member.id;
  
  const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 300000 });
  collector.on('collect', async i => {
    if(i.customId == "prevPage") {
      await i.deferUpdate();
      if (currentPage > 0) {
        msg.edit({ embeds: [array[(currentPage - 1)]], components: [row] });
        --currentPage;
      }
    } else if(i.customId == "nextPage") {
      await i.deferUpdate();
      if (currentPage < (array.length - 1)) {
        msg.edit({ embeds: [array[(currentPage + 1)]], components: [row] });
        ++currentPage;
      }
    }
  });
  collector.on('end', async () => {
    nextBttn.setDisabled(true).setStyle(ButtonStyle.Secondary);
    prevBttn.setDisabled(true).setStyle(ButtonStyle.Secondary);
    row.setComponents([prevBttn, nextBttn]);
      
    msg.edit({ embeds: [array[currentPage]], components: [row] });
  });
};