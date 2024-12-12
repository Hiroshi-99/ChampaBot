const mongoose = require("mongoose");

const CooldownsSchema = new mongoose.Schema({
  work: {
    type: Number,
    default: 0
  },
  bet: {
    type: Number,
    default: 0
  },
  daily: {
    type: Number,
    default: 0
  },
  workApply: {
    type: Number,
    default: 0
  }
});

const TicketsSchema = new mongoose.Schema({
  channel: String,
  id: String,
  reason: String
});

const InvitesSchema = new mongoose.Schema({
  joins: {
    type: Number,
    default: 0
  },
  leaves: {
    type: Number,
    default: 0
  },
  regular: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  inviter:  {
    type: String,
    default: ""
  },
  history: {
    type: [String],
    default: []
  }
})

const User = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  level: Number,
  xp: Number,
  messages: Number,
  money: Number,
  bank: Number,
  invites: InvitesSchema,
  cooldowns: CooldownsSchema,
  birthday: Date,
  tickets: [TicketsSchema],
  infractions: [],
  tempBan: String,
  warns: {
    type: Number,
    default: 0
  },
  savedRoles: [],
  currentJob: {
    id: String,
    name: String
  }
});

module.exports = mongoose.model("User", User);