const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  pollId: { type: String, required: true, unique: true },
  tripName: { type: String, required: true },
  groupSize: { type: Number },
  options: [{
    name: { type: String, required: true }, // Usually the city name
    votes: { type: Number, default: 0 },
    city: { type: String },
    tags: { type: [String], default: [] },
    vibe: { type: String }
  }],
  isClosed: { type: Boolean, default: false },
  winner: { type: String, default: null },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Poll", pollSchema);