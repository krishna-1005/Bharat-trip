const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  pollId: { type: String, required: true, unique: true },
  tripName: { type: String, required: true },
  options: [{
    name: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  isClosed: { type: Boolean, default: false },
  winner: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Poll", pollSchema);