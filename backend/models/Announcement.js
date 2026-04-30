const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["info", "warning", "success", "promotion"],
    default: "info"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  targetPage: {
    type: String,
    default: "all" // e.g., "home", "explore", "planner", "all"
  },
  link: {
    type: String,
    default: ""
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
