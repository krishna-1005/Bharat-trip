const mongoose = require("mongoose");

const usageLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    default: "generate_plan" 
  },
  userId: {
    type: String,
    default: null
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  details: { 
    type: mongoose.Schema.Types.Mixed 
  },
  ipAddress: { 
    type: String 
  },
  userAgent: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("UsageLog", usageLogSchema);
