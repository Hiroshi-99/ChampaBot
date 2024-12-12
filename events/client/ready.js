const Event = require("../../structures/Events");
const Discord = require("discord.js");
const chalk = require("chalk");
const { channelRoleCheck, generateInvitesCache, filesCheck, databaseChecks } = require("../../utils/utils.js");
const cron = require("cron");

module.exports = class Ready extends Event {
	constructor(client) {
	  super(client, "ready");
		this.client = client;
	}

	async run() {
		const config = this.client.config;
		let error = false;
		let foundErrors = [];
		let foundWarn = [];
		let usedGuild = this.client.guilds.cache.get(config.general.guild);
		if(!this.client.config.general.guild || !usedGuild) {
			error = true;
			this.client.utils.sendError(" ");
			this.client.utils.sendError("Config Field (general.guild) contains invalid Guild ID.");
			this.client.utils.sendError("or bot hasn't been invited to the server.");
			this.client.utils.sendError(" ");
			console.log(" ");
			foundErrors.push("Invalid Guild ID (general.guild)");
		}
		
		let guildData = await this.client.database.guildData()?.get(usedGuild.id) || {};

		if(!guildData && config.general.database.type == "mongo") {
			guildData = await this.client.database.guildData().createDefault(config.general.guild);
		}

    //== Look for Missing Directories and Files ==//
		filesCheck();

		//== Delete unused data from Database ==//
		await databaseChecks(this.client, guildData);
		
		//== Check NodeJS Version ==//
		let nodeVersion = process.version.replace("v", "");
		if(nodeVersion.split(".")[1].length == 1) nodeVersion = nodeVersion.split(".")[0] + ".0" + nodeVersion.split(".")[1];
		
		if(nodeVersion < "20.13") {
		  error = true;
			this.client.utils.sendError("Detected NodeJS Version (" + process.version + ") but expected v20.13+. Please Upgrade.");
			this.client.utils.sendError("NodeJS Version v20.13+ is recommended one, v18.20 is minimum.");
			foundErrors.push("UnSupported NodeJS Version");
		}
		
		if(!this.client.config.general.guild || !this.client.guilds.cache.get(this.client.config.general.guild)) {
			error = true;
			this.client.utils.sendError("Config Field (general.guild) contains invalid Guild ID. Slash Commands won't work properly without this!");
			foundErrors.push("Invalid Guild ID");
		}

		//== Look for Invalid Channel & Roles in Config ==//
		channelRoleCheck(this.client, usedGuild, foundWarn);
		
		if(config.auto_announce.enabled == true) {
		  setInterval(() => {
		    const annRand = Math.floor(Math.random() * config.auto_announce.list.length + 1);
  		  if (this.client.config.auto_announce.type == "EMBED") {
  		    let annEmbed = new Discord.EmbedBuilder()
  		      .setTitle(this.client.language.titles.auto_announce)
  		      .setColor(this.client.embeds.general_color)
  		      .setDescription(this.client.language.general.auto_announce.replace("<message>", this.client.config.auto_announce.list[annRand]));
  
  		    let annChannel = this.client.channels.cache.get(config.channels.announce);
  		    if(annChannel) 
						annChannel.send({ embeds: [annEmbed] });
  		  } else if (this.client.config.auto_announce.type == "TEXT") {
  		    let annChannel = this.client.channels.cache.get(config.channels.announce);
  		    if(annChannel)
						annChannel.send({ content: this.client.config.auto_announce.list[annRand] });
  		  } else {
  		    this.client.utils.sendWarn("Invalid Message Type for Auto Announcements Message Provided.");
  		  }
		  }, config.auto_announce.interval * 1000);
		}
    
		let fetchedInvites = null;
		await usedGuild.invites.fetch().catch(() => {});
		fetchedInvites = generateInvitesCache(usedGuild.invites.cache);
    this.client.invites.set(usedGuild.id, fetchedInvites);
		
		let robotCount = this.client.users.cache.filter((u) => u.bot == true).size;
		
		if(config.status.change_random == true) {
			const rand = Math.floor(Math.random() * config.status.messages.length);
      
			this.client.user.setActivity(config.status.messages[rand].replace("<members>", (usedGuild.memberCount - robotCount))
			  .replace("<channels>", this.client.channels.cache.size)
			  .replace("<prefix>", this.client.config.general.prefix), { type: Discord.ActivityType[config.status.type] });
			
			setInterval(() => {
				robotCount = this.client.users.cache.filter((u) => u.bot == true).size;
				const index = Math.floor(Math.random() * config.status.messages.length);
					this.client.user.setActivity(config.status.messages[index].replace("<members>", (usedGuild.memberCount - robotCount))
			      .replace("<channels>", this.client.channels.cache.size)
			      .replace("<prefix>", this.client.config.general.prefix), { type: Discord.ActivityType[config.status.type] });
			}, config.status.interval * 1000);
		} else {
			this.client.user.setActivity(this.client.config.status.message.replace("<members>", (usedGuild.memberCount - robotCount))
			  .replace("<channels>", this.client.channels.cache.size)
			  .replace("<prefix>", this.client.config.general.prefix), { type: Discord.ActivityType[config.status.type] });
		}
		setInterval(() => {
			this.client.utils.updateStats(this.client, usedGuild);
		}, 180000);

		//== CHECK BIRTHDAYS ==//
		const checkBirthdays = async() => {
			const isToday = (d) => d ? new Date().getDate() === new Date(d).getDate() &&
				new Date().getMonth() === new Date(d).getMonth() : false;
	
			let birthdays = (await this.client.database.usersData().all());
	
			let birthEmbed = birthdays
				.filter((b) => isToday(b.value?.birthday ?? b.birthday))
				.map((s) => {
					let birthdayUsr = client.users.cache.get(s.id) || "N/A";
					return `${birthdayUsr}\n`;
				});
			
			const bdayChannel = this.client.utils.findChannel(usedGuild, config.channels.birthday);
			if(!bdayChannel) this.client.utils.sendError("Announce Birthdays options is enabled but Birthdays Channel is not setuped.")
	
			if (bdayChannel && birthEmbed.length > 0)
				bdayChannel.send({ embeds: [this.client.embedBuilder(this.client, null, this.client.language.titles.birthdays, this.client.language.member.bday_ann.replace("<birthdays>", birthEmbed), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
		}
	
		let bdayCron = new cron.CronJob("10 00 00 * * *", () => checkBirthdays(), {
			timezone: "Europe/Belgrade",
		});
	
		if(this.client.config.plugins.birthday.announce_birthdays == true) bdayCron.start();

		await this.client.utils.unbanChecker(this.client, usedGuild);

		//== UPDATE GIVEAWAYS ==//
		setInterval(async() => {
			await this.client.gw.checkGiveaway(this.client, usedGuild);
		}, 25000);

    if(this.client.config.general.slash == true) {
			try {
				let oldCommands = await this.client.guilds.cache.get(this.client.config.general.guild).commands.fetch();
				oldCommands = Array.from(oldCommands).map((x) => {
					const obj = {
						name: x[1].name,
						description: x[1].description,
						type: x[1].type,
						options: x[1].options ?? [],
					};
					if(x[1].context == true) delete obj["description"];

					return obj;
				}).sort((a, b) => b.name - a.name);

				const newCommands = JSON.stringify(this.client.slashArray.map((x) => {
					let obj = {
						name: x.name,
						description: x.description,
						type: x.type,
						options: x.options ?? [],
					}
					if(x.context == true) delete obj["description"];
					
					return obj;
				}).sort((a, b) => b.name - a.name));

				if(oldCommands != newCommands) await this.client.guilds.cache.get(this.client.config.general.guild).commands.set(this.client.slashArray); 
				// await this.client.application.commands.set([]);
			} catch(e) {
				error = true;
				this.client.utils.sendError("Bot haven't been invited with applications.commands scope. Please ReInvite Bot with Required Scope(s).");
				foundErrors.push("Invalid Scopes");
			}
    } else {
			try {
				await this.client.guilds.cache.get(this.client.config.general.guild).commands.set([]);
				// await this.client.application.commands.set([]);
			} catch(e) {
				error = true;
				this.client.utils.sendError("Bot haven't been invited with applications.commands scope. Please ReInvite Bot with Required Scope(s).");
				foundErrors.push("Invalid Scopes");
			}
    }

		//== Set Bot's Status ==//		
		this.client.user.setStatus(config.status.presence_status?.toLowerCase() || "online");

		if(error || foundErrors.length > 0) {
			console.log("");
			console.log(chalk.gray("▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃"));
			console.log("")
			console.log(chalk.red.bold(`${config.general.name.toUpperCase()} ${config.version.toUpperCase()}`));
			console.log("");
			console.log(chalk.white(`There was an error while starting bot, please look above for detailed error.`));
			console.log(chalk.white(`Bot should be online if it's not an important error.`));
			console.log("");
			console.log(chalk.red(`Startup Errors (${foundErrors.length}): `) + chalk.white(foundErrors.join(", ").trim() + "."));
			console.log("")
			console.log(chalk.gray("▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃"));
			console.log(" ");
		} else {
			let addons = chalk.greenBright(`Loaded (${this.client.addonList.length}) Addons: `) + this.client.addonList.join(", ") + ".";
			let warns = chalk.green(`Startup Warnings (${foundWarn.length}): `) + foundWarn.join(", ").trim() + "."
			console.log("");
			console.log(chalk.gray("▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃"));
			console.log("")
			console.log(chalk.blue.bold(`${config.general.name.toUpperCase()} ${config.version.toUpperCase()}`));
			console.log("");
			console.log(chalk.white(`Thank you for your purchase, bot has started and is online now!`));
			console.log("")
			console.log(this.client.addonList.length > 0 ? addons : "No Addons Loaded");
			console.log(foundWarn.length > 0 ? warns : "No Warnings or Errors on startup, good job!")
			console.log("")
			console.log(chalk.gray("▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃"));
			console.log(" ");
		}
	}
};
