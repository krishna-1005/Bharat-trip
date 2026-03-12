const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
  estimatedCost: Number,
  category: String
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
  }

}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);