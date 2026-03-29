const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
  estimatedCost: Number,
  category: String,
  rating: Number,
  reviews: Number,
  tag: String,
  userReviews: [{
    author: String,
    rating: Number,
    comment: String
  }]
});

const daySchema = new mongoose.Schema({
  day: String,
  estimatedHours: Number,
  estimatedCost: Number,
  places: [placeSchema]
});

const tripSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    default: "Custom Trip"
  },

  destination: {
    type: String,
    required: true
  },

  days: {
    type: Number,
    required: true
  },

  itinerary: [daySchema],

  totalTripCost: {
    type: Number,
    default: 0
  },

  totalBudget: Number,
  remainingBudget: Number,
  perDayBudget: Number,

  summary: String,
  travelerType: String,
  pace: String,
  
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  }

}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);