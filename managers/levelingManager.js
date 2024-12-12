const Discord = require("discord.js");

const manageLeveling = async (client, message) => {
  if(!client.talkedRecently.has(message.author.id)) {
    client.talkedRecently.add(message.author.id);
    setTimeout(() => {
      client.talkedRecently.delete(message.author.id);
    }, client.config.plugins.leveling.cooldown * 1000);

    const userData = await client.database.usersData().get(`${message.author.id}`) || {};
    let xp = parseInt(userData.xp);
    let level = parseInt(userData.level);

    if(!xp || !level) {
      await client.database.usersData().add(`${message.author.id}.xp`, 1);
      await client.database.usersData().add(`${message.author.id}.level`, 1);
    }

    const xpGive = Math.floor(Math.random() * (50 - 30 + 1) + 30); 
    
    const nextLevel = parseInt(level) + 1;
    const xpNeeded = nextLevel * 2 * 250 + 250;

    if (xp + xpGive >= xpNeeded) {
      const embed = new Discord.EmbedBuilder()
        .setDescription(client.language.member.levelup.replace("<user>", message.author.username)
          .replace("<level>", nextLevel))
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(client.embeds.general_color);

      if(client.language.titles.levelup) embed.setTitle(client.language.titles.levelup);

      if(client.config.plugins.leveling.message == true) {
        const levelChannel = client.utils.findChannel(message.guild, client.config.channels.level);
        if(levelChannel) levelChannel.send({ embeds: [embed] });
        else message.channel.send({ embeds: [embed] });
      }
      
      if(xp + xpGive > xpNeeded) {
        await client.database.usersData().set(`${message.author.id}.xp`, xp - (xpNeeded - xpGive));
        await client.database.usersData().add(`${message.author.id}.level`, 1);
      } else {
        await client.database.usersData().set(`${message.author.id}.xp`, 0);
        await client.database.usersData().add(`${message.author.id}.level`, 1);
      }
      let rLevel = await client.database.usersData().get(`${message.author.id}.level`);
      let levelingRoles = Object.keys(client.config.roles.leveling.list);
      if(client.config.roles.leveling.enabled == true && levelingRoles.length > 0) {
        for(let i = 0; i < Object.keys(client.config.roles.leveling.list).length; i++) {
          if(Object.keys(client.config.roles.leveling.list)[i] == rLevel) {
            let rewardIndex = levelingRoles.indexOf(`${rLevel}`)
            if(rewardIndex > 0 && client.config.roles.leveling.stack == false) {
              await message.member.roles.remove(client.utils.findRole(message.guild, Object.values(client.config.roles.leveling.list)[rewardIndex - 1])).catch((err) => {});
            }
            return await message.member.roles.add(client.utils.findRole(message.guild, Object.values(client.config.roles.leveling.list)[i]));
          }
        }
      }
    } else {
      if(!message.author.bot) {
        await client.database.usersData().add(`${message.author.id}.xp`, xpGive);
      }
    }
  }
}

module.exports = {
  manageLeveling,
}
