const Command = require("../../structures/Command");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");


module.exports = class BirthdaysComing extends Command {
  constructor(client) {
    super(client, {
      name: "birthdayscoming",
      description: client.cmdConfig.birthdayscoming.description,
      usage: client.cmdConfig.birthdayscoming.usage,
      permissions: client.cmdConfig.birthdayscoming.permissions,
      aliases: client.cmdConfig.birthdayscoming.aliases,
      category: "member",
      enabled: client.cmdConfig.birthdayscoming.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    const isToday = (d) => d ? new Date().getMonth() === new Date(d).getMonth() 
      && new Date().getDate() <= new Date(d).getDate() : false;
    
    let birthdays = (await this.client.database.usersData().all());

    birthdays = birthdays
      .filter((b) => isToday(Date.parse(`${b.value?.birthday ?? b.birthday} GMT`)))
      .map((s) => {
        let bUser = this.client.users.cache.get(s.id) || "N/A";
        return `> **${s.value?.birthday?.trim() ?? s.birthday.trim()}** - ${bUser}\n`;
      });

    if(birthdays.length == 0)
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.bday_list_empty, this.client.embeds.error_color)] });

    this.client.paginateContent(this.client, birthdays, 10, 1, message, this.client.language.titles.birthdays_mon, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    const isToday = (d) => d ? new Date().getMonth() === new Date(d).getMonth() 
      && new Date().getDate() <= new Date(d).getDate() : false;

    let birthdays = (await this.client.database.usersData().all());

    birthdays = birthdays
      .filter((b) => isToday(Date.parse(`${b.value?.birthday ?? b.birthday} GMT`)))
      .map((s) => {
        let bUser = this.client.users.cache.get(s.id) || "N/A";
        return `> **${s.value?.birthday?.trim() ?? s.birthday.trim()}** - ${bUser}\n`;
      });

    if(birthdays.length == 0)
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.bday_list_empty, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.birthdayscoming.ephemeral });

    this.client.paginateContent(this.client, birthdays, 10, 1, interaction, this.client.language.titles.birthdays_mon, this.client.embeds.general_color);
  }
};
