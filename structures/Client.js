const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { Player } = require("discord-player");
const { SpotifyExtractor, SoundCloudExtractor } = require('@discord-player/extractor');
const { YoutubeiExtractor, createYoutubeiStream } = require('discord-player-youtubei');
const { QuickDB } = require("quick.db");
const yaml = require('yaml');
const express = require("express");
const fs = require("fs");
const indexRoute = require("../dashboard/routes/index.js");
const path = require("path")
const ejs = require("ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const chalk = require("chalk");
const Database = require("./database/Database.js");

module.exports = class BotClient extends Client {
  constructor() {
    super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent], 
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]});

    // Files
    
    this.config = yaml.parse(fs.readFileSync('./configs/config.yml', 'utf8'));
    this.language = yaml.parse(fs.readFileSync('./configs/language.yml', 'utf8'));
    this.cmdConfig = yaml.parse(fs.readFileSync('./configs/commands.yml', 'utf8'));
    this.embeds = yaml.parse(fs.readFileSync('./configs/embeds.yml', 'utf8'));
    this.utils = require("../utils/utils.js");
    this.setupUtils = require("../utils/setupUtils.js");
    this.paginateContent = require("../embeds/paginateContent.js");
    this.gw = require("../managers/giveawayManager.js");
    this.embedBuilder = require("../embeds/embedBuilder.js");
   
    // Database //
    this.database = new Database(this, this.config.general.database.type);

    // Catch & Save Errors //
    process.on("uncaughtException", (error) => {
      this.utils.sendError(error?.stack || error);
    });

    process.on("unhandledRejection", (error) => {
      this.utils.sendError(error?.stack || error);
    });

    // Other //
    
    this.player = new Player(this, {
      skipFFmpeg: false,
      useLegacyFFmpeg: false,
      leaveOnEnd: true,
      leaveOnStop: true,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 60000,
      autoSelfDeaf: true,
      initialVolume: 70,
      connectionTimeoutut: 120
    });

    (async() => {
      await this.player.extractors.register(YoutubeiExtractor, {});
      await this.player.extractors.register(SpotifyExtractor, {
        createStream: createYoutubeiStream,
      });
      await this.player.extractors.register(SoundCloudExtractor, {});

      await this.player.extractors.loadDefault(
        (ext) =>
          !["YouTubeExtractor", "SpotifyExtractor"].includes(
            ext
          )
      );
    })();

    this.player.on("error", (queue, error) => {
      console.log(error);
    });
    
    this.player.on("connectionError", (queue, error) => {
      console.log(error);
    });

    this.db = new QuickDB();

    this.startServer();
    
    this.aliases = new Collection();
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.invites = new Collection();
    this.gwCreation = new Map();
    this.talkedRecently = new Set();
    this.coinsCooldown = new Set();
    this.autoResponse = new Collection();
    this.slashArray = [];
    this.addonList = [];
        
    // MongoDB Cache //
    this.dbCache = new Collection();
    this.usersCache = new Collection();
    this.ticketsCache = new Collection();
  }
  async login(token = this.config.general.token) {
    super.login(token);
  }
  startServer() {
    if(this.config.server.enabled == true) {
      const app = express();
      app.use(bodyParser.json());
      app.use(cookieParser());
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      if(this.config.server.dashboard.enabled == true) {
        app.set("view engine", "ejs")
          .set("views", "dashboard/views")
          .use(express.static(path.join(__dirname, "../dashboard/public")))

        app.engine("ejs", async (path, data, cb) => {
          try{
            let html = await ejs.renderFile(path, data, {
              async: true
            });
            cb(null, html);
          } catch (e) {
            cb(e, "");
          }
        });

        app.use((req, res, next) => {
          req.client = this;
          req.guild = this.guilds.cache.get(this.config.general.guild);
          next();
        });

        app.use("/", indexRoute)

        app.use((req, res, next) => {
          res.redirect("/404");
        });
      }
      
      app.listen(this.config.server.port || "7071", () => console.log(chalk.yellow("[SERVER] ") + `Server has started on port ${this.config.server.port}.`));
    }
  }
}