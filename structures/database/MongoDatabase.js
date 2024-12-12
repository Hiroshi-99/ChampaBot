const mongoose = require("mongoose");
const chalk = require("chalk");
const MongoData = require("./MongoData");
const User = require("./models/User");
const Ticket = require("./models/Ticket");
const Suggestion = require("./models/Suggestion");
const Guild = require("./models/Guild");
const Giveaway = require("./models/Giveaway");

module.exports = class MongoDatabase {
  database;
  constructor(client) {
    this.client = client;

    this.initDatabase();
  }

  initDatabase() {
    mongoose.connect(this.client.config.general.database.mongo.uri, {
      useNewUrlParser: true,
    }).then(() => {
      console.log(chalk.green("[DATABASE] ") + "Connection to MongoDB established.");
    })
    .catch((err) => console.log(err));
  }

  usersData() {
    return new MongoData(this.client, User);
  }

  ticketsData() {
    return new MongoData(this.client, Ticket);
  }

  suggestionsData() {
    return new MongoData(this.client, Suggestion);
  }

  gwData() {
    return new MongoData(this.client, Giveaway);
  }

  guildData() {
    return new MongoData(this.client, Guild);
  }
}