const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true
  },
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  }],
  linkedEventId: { type: mongoose.Schema.Types.ObjectId }, // Reference to itinerary event
  status: { 
    type: String, 
    enum: ["open", "closed"], 
    default: "open" 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Poll || mongoose.model("Poll", pollSchema);
