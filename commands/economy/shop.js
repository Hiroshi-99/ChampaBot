const Command = require("../../structures/Command");
const Discord = require("discord.js");


module.exports = class Shop extends Command {
  constructor(client) {
    super(client, {
      name: "shop",
      description: client.cmdConfig.shop.description,
      usage: client.cmdConfig.shop.usage,
      permissions: client.cmdConfig.shop.permissions,
      aliases: client.cmdConfig.shop.aliases,
      category: "economy",
      enabled: client.cmdConfig.shop.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    const plugin = this.client.config.plugins.economy;
    if(plugin.shop.enabled == false) return;
    const shopItems =  plugin.shop.items;
    let itemArr = [];

    for(let i = 0; i < shopItems.length; i++) {
      itemArr.push(plugin.shop.item_format.replace("<id>", i+1)
        .replace("<name>", shopItems[i].name)
        .replace("<price>", shopItems[i].price)
        .replace("<description>", shopItems[i].description));
    }

    this.client.paginateContent(this.client, itemArr, 10, 1, message, this.client.language.titles.shop, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    const plugin = this.client.config.plugins.economy;
    if(plugin.shop.enabled == false) return;
    const shopItems =  plugin.shop.items;
    let itemArr = [];

    for(let i = 0; i < shopItems.length; i++) {
      itemArr.push(plugin.shop.item_format.replace("<id>", i+1)
        .replace("<name>", shopItems[i].name)
        .replace("<price>", shopItems[i].price)
        .replace("<description>", shopItems[i].description));
    }

    this.client.paginateContent(this.client, itemArr, 10, 1, interaction, this.client.language.titles.shop, this.client.embeds.general_color);
  }
};
