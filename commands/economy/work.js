const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const { ApplicationCommandOptionType } = require("discord.js");
const db = new QuickDB();
const paginateEmbeds = require("../../embeds/paginateEmbeds");

module.exports = class Work extends Command {
  constructor(client) {
    super(client, {
      name: "work",
      description: client.cmdConfig.work.description,
      usage: client.cmdConfig.work.usage,
      permissions: client.cmdConfig.work.permissions,
      aliases: client.cmdConfig.work.aliases,
      category: "economy",
      enabled: client.cmdConfig.work.enabled,
      slash: true,
      options: [{
        name: "action",
        description: "Action you want to do",
        type: ApplicationCommandOptionType.String,
        choices: [{
          name: "Apply",
          value: "apply"
        }, {
          name: "List of Jobs",
          value: "jobs"
        }, {
          name: "Help Menu",
          value: "help"
        }, {
          name: "Quit Job",
          value: "quit"
        }]
      }, {
        name: "job",
        description: "Job to Apply for",
        type: ApplicationCommandOptionType.String,
        required: false
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    if(config.plugins.economy.work_type == "NORMAL") {
      let rand = Math.floor(Math.random() * (config.plugins.economy.jobs.length - 1) + 1);
  
      let job = config.plugins.economy.jobs[rand];
      let salary = Math.floor(Math.random() * (job.max - job.min + 1) + job.min);
  
      await this.client.database.usersData().add(`${message.author.id}.money`, Number(salary));
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.worked.replace("<job>", job.name).replace("<salary>", salary), this.client.embeds.success_color)] });
    } else {
      const option = args[0];
      const value = args[1];

      const userData = await this.client.database.usersData().get(`${message.author.id}`) || {};
      userData.cooldowns = userData.cooldowns || {};
      const userJob = userData.currentJob || {};

      let jobsMainMenu = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.economy.jobs_list.color);
      
      if(this.client.embeds.economy.jobs_main.title) jobsMainMenu.setTitle(this.client.embeds.economy.jobs_main.title);
      if(this.client.embeds.economy.jobs_main.description) jobsMainMenu.setDescription(this.client.embeds.economy.jobs_main.description);
      if(this.client.embeds.economy.jobs_main.footer == true) jobsMainMenu.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();

      for(const field of this.client.embeds.economy.jobs_main.fields) {
        jobsMainMenu.addFields([{ name: field.title, value: field.description }]);
      }

      let joblistChunks = [], embedsChunk = [];
      for(let i = 0; i < config.plugins.economy.jobs.length; i += 16) {
        const chunk = config.plugins.economy.jobs.slice(i, i + 16);
        joblistChunks.push(chunk);
      }

      for(let i = 0; i < joblistChunks.length; i++) {
        embedsChunk.push(
          joblistChunks[i].map((job) => {
            return {
              name: this.client.embeds.economy.jobs_list.fields_format.name.replace("<jobName>", job.name)
              .replace("<minSalary>", job.min)
              .replace("<maxSalary>", job.max)
              .replace("<cooldown>", this.client.utils.formatTime(job.cooldown * 1000)),
              value: this.client.embeds.economy.jobs_list.fields_format.value.replace("<jobName>", job.name)
              .replace("<minSalary>", job.min)
              .replace("<maxSalary>", job.max)
              .replace("<cooldown>", this.client.utils.formatTime(job.cooldown * 1000))
            };
          })
        )
      }

      const paginatedEmbeds = embedsChunk.map((x, i) => {
        let joblistEmbed = new Discord.EmbedBuilder()
          .setColor(this.client.embeds.economy.jobs_list.color);
    
        if(this.client.embeds.economy.jobs_list.title) joblistEmbed.setTitle(this.client.embeds.economy.jobs_list.title);
        if(this.client.embeds.economy.jobs_list.description) joblistEmbed.setDescription(this.client.embeds.economy.jobs_list.description);
        if(this.client.embeds.economy.jobs_list.footer == true) joblistEmbed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();

        return joblistEmbed.addFields(x);
      });

      if(!option) {
        if(!userJob.id) return message.channel.send({ embeds: [jobsMainMenu] });

        const currentJob = config.plugins.economy.jobs.find((j) => j.id == userJob.id || j.name.toLowerCase() == userJob.name.toLowerCase());
        if(!currentJob) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.job_broken, this.client.embeds.error_color)] });;

        const workCooldown = userData.cooldowns.work;
        if(workCooldown != null && (currentJob.cooldown * 1000) - (Date.now() - workCooldown) > 0) 
          return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.cooldown.replace("<cooldown>", this.client.utils.formatTime((currentJob.cooldown * 1000) - (Date.now() - workCooldown))), this.client.embeds.error_color)] });;
    
        const salary = Math.floor(Math.random() * (currentJob.max - currentJob.min + 1)) + currentJob.min;

        await this.client.database.usersData().add(`${message.author.id}.money`, Number(salary));
        userData.cooldowns.work = Date.now();
        await this.client.database.usersData().set(`${message.author.id}.cooldowns`, userData.cooldowns);
        message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.worked.replace("<job>", currentJob.name).replace("<salary>", salary), this.client.embeds.success_color)] });
        return;
      }

      if(option.toLowerCase() == "apply") {
        if(!value) return paginateEmbeds(this.client, paginatedEmbeds, message);

        if(userJob.id) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.already_employed.replace("<job>", userJob.name), this.client.embeds.error_color)] });;

        const searchJob = config.plugins.economy.jobs.find((j) => j.name.toLowerCase() == value.toLowerCase() || j.name.toLowerCase().includes(value.toLowerCase()));
        if(!searchJob) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.invalid_job, this.client.embeds.error_color)] });

        const randomChance = Math.floor(Math.random() * 6);
        const workApplyCooldown = userData.cooldowns.workApply;
        if(workApplyCooldown != null && (config.plugins.economy.apply_cooldown * 1000) - (Date.now() - workApplyCooldown) > 0) 
          return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.apply_cooldown.replace("<cooldown>", this.client.utils.formatTime((config.plugins.economy.apply_cooldown * 1000) - (Date.now() - workApplyCooldown))), this.client.embeds.error_color)] });;

        if(randomChance % 2 == 0 && config.plugins.economy.apply_chance == true) 
          return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.apply_denied.replace("<job>", searchJob.name), this.client.embeds.error_color)] });;

        await this.client.database.usersData().set(`${message.author.id}.currentJob`, {
          id: searchJob.id,
          name: searchJob.name
        });
        userData.cooldowns.workApply = Date.now();
        await this.client.database.usersData().set(`${message.author.id}.cooldowns`, userData.cooldowns);
        
        message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.apply_accepted.replace("<job>", searchJob.name), this.client.embeds.success_color)] });
      } else if(option.toLowerCase() == "jobs") {
        paginateEmbeds(this.client, paginatedEmbeds, message);
      } else if(option.toLowerCase() == "quit") {
        if(!userJob.id) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.not_employed, this.client.embeds.error_color)] });

        await this.client.database.usersData().delete(`${message.author.id}.currentJob`);
        message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.jobs.quit.replace("<job>", userJob.name), this.client.embeds.success_color)] });
      } else if(option.toLowerCase() == "help") {
        message.channel.send({ embeds: [jobsMainMenu] });
      } else {
        message.channel.send({ embeds: [jobsMainMenu] });
      }
    }
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    if(config.plugins.economy.work_type == "NORMAL") {
      let rand = Math.floor(Math.random() * (config.plugins.economy.jobs.length - 1) + 1);
    
      let job = config.plugins.economy.jobs[rand];
      let salary = Math.floor(Math.random() * (job.max - job.min + 1) + job.min);
    
      await this.client.database.usersData().add(`${interaction.user.id}.money`, Number(salary));
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.worked.replace("<job>", job.name).replace("<salary>", salary), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.work.ephemeral });
    } else {
      const option = interaction.options.getString("action");
      const value = interaction.options.getString("job");
    
      const userData = await this.client.database.usersData().get(`${interaction.user.id}`) || {};
      userData.cooldowns = userData.cooldowns || {};
      const userJob = userData.currentJob || {};
    
      let jobsMainMenu = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.economy.jobs_list.color);
      
      if(this.client.embeds.economy.jobs_main.title) jobsMainMenu.setTitle(this.client.embeds.economy.jobs_main.title);
      if(this.client.embeds.economy.jobs_main.description) jobsMainMenu.setDescription(this.client.embeds.economy.jobs_main.description);
      if(this.client.embeds.economy.jobs_main.footer == true) jobsMainMenu.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    
      for(const field of this.client.embeds.economy.jobs_main.fields) {
        jobsMainMenu.addFields([{ name: field.title, value: field.description }]);
      }

      let joblistChunks = [], embedsChunk = [];
      for(let i = 0; i < config.plugins.economy.jobs.length; i += 16) {
        const chunk = config.plugins.economy.jobs.slice(i, i + 16);
        joblistChunks.push(chunk);
      }

      for(let i = 0; i < joblistChunks.length; i++) {
        embedsChunk.push(
          joblistChunks[i].map((job) => {
            return {
              name: this.client.embeds.economy.jobs_list.fields_format.name.replace("<jobName>", job.name)
              .replace("<minSalary>", job.min)
              .replace("<maxSalary>", job.max)
              .replace("<cooldown>", this.client.utils.formatTime(job.cooldown * 1000)),
              value: this.client.embeds.economy.jobs_list.fields_format.value.replace("<jobName>", job.name)
              .replace("<minSalary>", job.min)
              .replace("<maxSalary>", job.max)
              .replace("<cooldown>", this.client.utils.formatTime(job.cooldown * 1000))
            };
          })
        )
      }

      const paginatedEmbeds = embedsChunk.map((x, i) => {
        let joblistEmbed = new Discord.EmbedBuilder()
          .setColor(this.client.embeds.economy.jobs_list.color);
    
        if(this.client.embeds.economy.jobs_list.title) joblistEmbed.setTitle(this.client.embeds.economy.jobs_list.title);
        if(this.client.embeds.economy.jobs_list.description) joblistEmbed.setDescription(this.client.embeds.economy.jobs_list.description);
        if(this.client.embeds.economy.jobs_list.footer == true) joblistEmbed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();

        return joblistEmbed.addFields(x);
      });

      if(!option) {
        if(!userJob.id) return interaction.reply({ embeds: [jobsMainMenu] });
    
        const currentJob = config.plugins.economy.jobs.find((j) => j.id == userJob.id || j.name.toLowerCase() == userJob.name.toLowerCase());
        if(!currentJob) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.job_broken, this.client.embeds.error_color)] });;

        const workCooldown = userData.cooldowns.work;
        if(workCooldown != null && (currentJob.cooldown * 1000) - (Date.now() - workCooldown) > 0) 
          return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.cooldown.replace("<cooldown>", this.client.utils.formatTime((currentJob.cooldown * 1000) - (Date.now() - workCooldown))), this.client.embeds.error_color)] });;
    
        const salary = Math.floor(Math.random() * (currentJob.max - currentJob.min + 1)) + currentJob.min;
    
        await this.client.database.usersData().add(`${interaction.user.id}.money`, Number(salary));
        userData.cooldowns.work = Date.now();
        await this.client.database.usersData().set(`${interaction.user.id}.cooldowns`, userData.cooldowns);
        interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.worked.replace("<job>", currentJob.name).replace("<salary>", salary), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.work.ephemeral });
        return;
      }
    
      if(option.toLowerCase() == "apply") {
        if(!value) return paginateEmbeds(this.client, paginatedEmbeds, interaction, this.client.cmdConfig.work.ephemeral);
    
        if(userJob.id) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.already_employed.replace("<job>", userJob.name), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.work.ephemeral });;
    
        const searchJob = config.plugins.economy.jobs.find((j) => j.name.toLowerCase() == value.toLowerCase() || j.name.toLowerCase().includes(value.toLowerCase()));
        if(!searchJob) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.invalid_job, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.work.ephemeral });
    
        const randomChance = Math.floor(Math.random() * 6);
        const workApplyCooldown = userData.cooldowns.workApply;
        if(workApplyCooldown != null && (config.plugins.economy.apply_cooldown * 1000) - (Date.now() - workApplyCooldown) > 0) 
          return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.apply_cooldown.replace("<cooldown>", this.client.utils.formatTime((config.plugins.economy.apply_cooldown * 1000) - (Date.now() - workApplyCooldown))), this.client.embeds.error_color)] });;
        
        if(randomChance % 2 == 0 && config.plugins.economy.apply_chance == true) 
          return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.apply_denied.replace("<job>", searchJob.name), this.client.embeds.error_color)] });;

        await this.client.database.usersData().set(`${interaction.user.id}.currentJob`, {
          id: searchJob.id,
          name: searchJob.name
        });
        userData.cooldowns.workApply = Date.now();
        await this.client.database.usersData().set(`${interaction.user.id}.cooldowns`, userData.cooldowns);
        
        interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.apply_accepted.replace("<job>", searchJob.name), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.work.ephemeral });
      } else if(option.toLowerCase() == "jobs") {
        paginateEmbeds(this.client, paginatedEmbeds, interaction, this.client.cmdConfig.work.ephemeral);
      } else if(option.toLowerCase() == "quit") {
        if(!userJob.id) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.not_employed, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.work.ephemeral });
    
        await this.client.database.usersData().delete(`${interaction.user.id}.currentJob`);
        interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.jobs.quit.replace("<job>", userJob.name), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.work.ephemeral });
      } else if(option.toLowerCase() == "help") {
        interaction.reply({ embeds: [jobsMainMenu], ephemeral: this.client.cmdConfig.work.ephemeral });
      } else {
        interaction.reply({ embeds: [jobsMainMenu], ephemeral: this.client.cmdConfig.work.ephemeral });
      }
    }
  }
};
