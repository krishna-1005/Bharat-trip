const mongoose = require("mongoose");

const GeneratedContentSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ["Instagram", "YouTube Shorts", "Twitter/X", "LinkedIn"],
  },
  contentType: {
    type: String,
    required: true,
    enum: ["Reel", "Carousel", "Story", "Tweet", "Ad Creative"],
  },
  tone: {
    type: String,
    required: true,
    enum: ["Viral", "Luxury", "Emotional", "Adventure", "Minimal"],
  },
  videoDuration: {
    type: String,
    enum: ["15 sec", "30 sec", "60 sec"],
  },
  generatedOutput: {
    hooks: [String],
    reelScript: [{
      scene: Number,
      visual: String,
      audio: String
    }],
    storyboard: [{
      shot: Number,
      description: String
    }],
    caption: String,
    hashtags: [String],
    thumbnailConcept: String,
    viralityScore: Number,
    engagementPrediction: String
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GeneratedContent", GeneratedContentSchema);
