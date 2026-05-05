const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true
  },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Keep for legacy/internal use if needed
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
