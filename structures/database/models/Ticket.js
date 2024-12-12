const mongoose = require("mongoose");

const Ticket = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  date: Date,
  owner: String,
  ticketId: Number,
});

module.exports = mongoose.model("Ticket", Ticket);