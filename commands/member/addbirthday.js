const Command = require("../../structures/Command");
const { ApplicationCommandOptionType } = require("discord.js");


module.exports = class AddBirthday extends Command {
  constructor(client) {
    super(client, {
      name: "addbirthday",
      description: client.cmdConfig.addbirthday.description,
      usage: client.cmdConfig.addbirthday.usage,
      permissions: client.cmdConfig.addbirthday.permissions,
      aliases: client.cmdConfig.addbirthday.aliases,
      category: "member",
      enabled: client.cmdConfig.addbirthday.enabled,
      slash: true,
      options: [{
        name: "date",
        type: ApplicationCommandOptionType.String,
        description: "Date of your format, ex. 24 July 2001",
        required: false
      }]
    });
  }

  async run(message, args) {
    let date = args.join(" ");

    const parseDate = new Date(Date.parse(`${date} GMT`));
    const bday = await this.client.database.usersData().get(`${message.author.id}.birthday`);

    if(parseDate && args[0] && !bday) {
      if(parseDate.toString() == "Invalid Date")
        return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.invalid_date, this.client.embeds.error_color)] });

      await this.client.database.usersData().set(`${message.author.id}.birthday`, date);
      message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.bday_set.replace("<date>", date), this.client.embeds.general_color)] });
    } else {
      if(!bday)
        return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.no_bday, this.client.embeds.error_color)] });

      await this.client.database.usersData().delete(`${message.author.id}.birthday`);
      message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.bday_reset, this.client.embeds.success_color)] });
    }
  }
  async slashRun(interaction, args) {
    let date = interaction.options.getString("date");

    const parseDate = new Date(Date.parse(`${date} GMT`));
    const bday = await this.client.database.usersData().get(`${interaction.user.id}.birthday`)

    if(parseDate && date && !bday) {
      if(parseDate.toString() == "Invalid Date")
        return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.invalid_date, this.client.embeds.error_color)] });

      await this.client.database.usersData().set(`${interaction.user.id}.birthday`, date);
      interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.bday_set.replace("<date>", date), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.addbirthday.ephemeral });
    } else {
      if(!bday)
        return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.no_bday, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.addbirthday.ephemeral });
      
      await this.client.database.usersData().delete(`${interaction.user.id}.birthday`);
      interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.bday_reset, this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.addbirthday.ephemeral });
    }
  }
};