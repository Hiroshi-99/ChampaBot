const mongoose = require("mongoose");

const GamesSchema = new mongoose.Schema({
  counting: Array
});

const CountersSchema = new mongoose.Schema({
  totalChannel: {
    type: String,
    default: ""
  },
  membersChannel: {
    type: String,
    default: ""
  },
  robotsChannel: {
    type: String,
    default: ""
  },
  channelsChannel: {
    type: String,
    default: ""
  },
  rolesChannel: {
    type: String,
    default: ""
  },
  boostsChannel: {
    type: String,
    default: ""
  },
  minecraftChannel: {
    type: String,
    default: ""
  }
})

const GuildSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  ticketCount: {
    type: Number,
    default: 0
  },
  games: GamesSchema,
  counters: CountersSchema,
  reactionRoles: [{
    id: String,
    message: String
  }],
  suggestionDecisions: {
    type: Array,
    default: [{
      id: String,
      decision: String
    }]
  },
  serverLogs: {
    type: Array,
    default: []
  },
  dashboardLogs: {
    type: Array,
    default: []
  },
  temporaryChannels: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model("Guild", GuildSchema);