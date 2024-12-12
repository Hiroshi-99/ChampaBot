const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Buy extends Command {
  constructor(client) {
    super(client, {
      name: "buy",
      description: client.cmdConfig.buy.description,
      usage: client.cmdConfig.buy.usage,
      permissions: client.cmdConfig.buy.permissions,
      aliases: client.cmdConfig.buy.aliases,
      category: "economy",
      enabled: client.cmdConfig.buy.enabled,
      slash: true,
      options: [{
        name: "shop_id",
        description: "ID of Shop Item you want to buy.",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true
      }]
    });
  }

  async run(message, args) {
    const plugin = this.client.config.plugins.economy;
    const shopItems = plugin.shop.items;
    const balance = await this.client.database.usersData().get(`${message.author.id}.money`) || 0;
    let item = args[0];
    if(isNaN(item) || !item || !shopItems[item-1]) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.buy.usage)] });
    if(balance < shopItems[item-1].price) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.no_enough, this.client.embeds.error_color)] });

    if(shopItems[item-1].type == "ROLE") {
      let findRole = this.client.utils.findRole(message.guild, shopItems[item-1].role);
      if(!findRole) this.client.utils.sendWarn("Someone has bought Item from Shop which has type of ROLE but `role` field is empty or Role provided doesn't exist!");
      if(findRole) await message.member.roles.add(findRole);
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.purchased.replace("<item>", shopItems[item-1].name).replace("<price>", shopItems[item-1].price), this.client.embeds.success_color)] });
      await this.client.database.usersData().sub(`${message.author.id}.money`, Number(shopItems[0].price));
    }
  }
  async slashRun(interaction, args) {
    const plugin = this.client.config.plugins.economy;
    const shopItems = plugin.shop.items;
    const balance = await this.client.database.usersData().get(`${interaction.user.id}.money`) || 0;
    let item = interaction.options.getNumber("shop_id");
    if(!shopItems[item-1]) return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, interaction, this.client.cmdConfig.buy.usage)] });
    if(balance < shopItems[item-1].price) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.no_enough, this.client.embeds.error_color)] });
  
    if(shopItems[item-1].type == "ROLE") {
      let findRole = this.client.utils.findRole(interaction.guild, shopItems[item-1].role);
      if(!findRole) this.client.utils.sendWarn("Someone has bought Item from Shop which has type of ROLE but `role` field is empty or Role provided doesn't exist!");
      if(findRole) await interaction.member.roles.add(findRole);
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.purchased.replace("<item>", shopItems[item-1].name).replace("<price>", shopItems[item-1].price), this.client.embeds.success_color)] });
      await this.client.database.usersData().sub(`${interaction.user.id}.money`, Number(shopItems[0].price));
    }
  }
};
