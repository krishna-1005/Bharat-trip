const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
  estimatedCost: Number,
  estimatedHours: Number,
  category: String,
  rating: Number,
  reviews: String,
  tag: String,
  bestTime: String,
  timeReason: String,
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
    required: false
  },

  isGuest: {
    type: Boolean,
    default: false
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

  recommendedStay: {
    name: String,
    avgCost: Number,
    rating: Number,
    tags: [String],
    lat: Number,
    lng: Number,
    stayType: String
  },

  recommendedTransport: {
    mode: String,
    reason: String,
    icon: String,
    distance: Number,
    from: String,
    to: String
  },
  
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  },

  isPublic: {
    type: Boolean,
    default: false
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  views: {
    type: Number,
    default: 0
  },

  savesCount: {
    type: Number,
    default: 0
  },

  image: {
    type: String,
    default: ""
  },

  members: [{
    userId: String,
    userName: String,
    joinedAt: { type: Date, default: Date.now }
  }],

  /* ── REBOOKING ENGINE DATA ── */
  disruptionAlerts: [{
    type: { type: String }, // e.g., "flight_delay", "weather"
    message: String,
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    timestamp: { type: Date, default: Date.now }
  }],

  pendingRevision: {
    itinerary: [daySchema],
    impactSummary: String,
    recalculationReason: String,
    createdAt: Date
  },

  queuedSupplierNotifications: [{
    supplierName: String,
    supplierType: { type: String, enum: ["hotel", "restaurant", "transport"] },
    actionType: String, // e.g., "late_checkin", "reschedule"
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    messageDraft: String,
    sentAt: Date
  }]

}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);