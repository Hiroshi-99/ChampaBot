const mongoose = require("mongoose");

const ReqSchema = new mongoose.Schema({
  messagesReq: Number,
  invitesReq: Number,
  roleReq: String
});

const GiveawaysSchema = new mongoose.Schema({
  id: {
    type: String
  },
  guildId: {
    type: String,
  },
  channel: {
    type: String,
  },
  prize: {
    type: String,
  },
  duration: {
    type: String,
  },
  hostedBy: {
    type: String,
  },
  winnerCount: {
    type: Number,
  },
  requirements: ReqSchema,
  roleBypass: {
    type: String,
  },
  ended: {
    type: Boolean,
  },
  endsAt: {
    type: mongoose.Schema.Types.Mixed,
  },
  winners: {
    type: Array,
  },
});

module.exports = mongoose.model("Giveaway", GiveawaysSchema);