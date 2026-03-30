const express = require("express");
const User    = require("../models/User");
const Trip    = require("../models/Trip");
const { protect } = require("../middleware/protect");

const router = express.Router();

// All routes below require login
router.use(protect);

/* ═══════════════════════════════════════
   PROFILE
═══════════════════════════════════════ */

/* GET /api/profile  — full profile + live stats */
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const tripsCount = await Trip.countDocuments({ userId: req.user._id });
    const upcoming = await Trip.countDocuments({userId: req.user._id,status: "upcoming"});
    const completed = await Trip.countDocuments({userId: req.user._id, status: "completed"});
    res.json({
      user: {
        ...user.toJSON(),
        memberSince: user.createdAt,
        stats: {
          tripsPlanned:     tripsCount,
          savedPlacesCount: user.savedPlaces ? user.savedPlaces.length : 0,
          upcoming,
          completed,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* PUT /api/profile  — update name or bio */
router.put("/", async (req, res) => {
  try {
    const { name, bio, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio)  updates.bio  = bio;
    if (preferences) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ message: "Profile updated.", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* DELETE /api/profile  — delete account + all trips */
router.delete("/", async (req, res) => {
  try {
    await Trip.deleteMany({ userId: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* ═══════════════════════════════════════
   MY TRIPS
═══════════════════════════════════════ */

/* GET /api/profile/trips?status=upcoming  — list all trips */
router.get("/trips", async (req, res) => {
  try {

    const filter = { userId: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const trips = await Trip.find(filter).sort({ createdAt: -1 });

    res.json({ trips });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* POST /api/profile/trips  — save a new trip (from planner) */
router.post("/trips", async (req, res) => {
  try {
    const { 
      title, city, days, budget, interests, itinerary, 
      totalCost, totalBudget, remainingBudget, perDayBudget, 
      travelerType, pace, summary 
    } = req.body;

    if (!title || !days)
      return res.status(400).json({ error: "title and days are required." });

    // Correctly map itinerary objects to include the day label if missing
    const formattedItinerary = Object.entries(itinerary || {}).map(([dayLabel, dayData]) => ({
      day: dayLabel,
      estimatedHours: dayData.estimatedHours || 0,
      estimatedCost: dayData.estimatedCost || 0,
      places: (dayData.places || []).map(p => ({
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        estimatedCost: p.estimatedCost || p.avgCost || 0,
        estimatedHours: p.estimatedHours || p.timeHours || 0,
        category: p.category,
        rating: p.rating,
        reviews: p.reviews,
        tag: p.tag,
        userReviews: p.userReviews || []
      }))
    }));

    const trip = await Trip.create({
      userId: req.user._id,
      title: title || "Custom Trip",
      destination: city || "Unknown",
      days: Number(days),
      itinerary: formattedItinerary,
      totalTripCost: Number(totalCost) || 0,
      totalBudget: Number(totalBudget) || 0,
      remainingBudget: Number(remainingBudget) || 0,
      perDayBudget: Number(perDayBudget) || 0,
      travelerType,
      pace,
      summary,
      status: "upcoming"
    });

    res.status(201).json({ message: "Trip saved.", trip });
  } catch (err) {
    console.error("SAVE TRIP ERROR:", err);
    res.status(500).json({ error: "Server error saving trip." });
  }
});

/* PATCH /api/profile/trips/:id/status  — mark upcoming/completed */
router.patch("/trips/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["upcoming", "ongoing", "completed"].includes(status))
      return res.status(400).json({ error: "Invalid status." });

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: "Trip not found." });

    res.json({ message: "Status updated.", trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* DELETE /api/profile/trips/:id  — delete a trip */
router.delete("/trips/:id", async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    res.json({ message: "Trip deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* GET /api/profile/trips/:id/memories  — get memories for a trip */
router.get("/trips/:id/memories", async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id }, "title memories");
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    res.json({ title: trip.title, memories: trip.memories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* POST /api/profile/trips/:id/memories  — add a memory image URL */
router.post("/trips/:id/memories", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl is required." });

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $push: { memories: imageUrl } },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    res.json({ message: "Memory added.", memories: trip.memories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* ═══════════════════════════════════════
   SAVED PLACES
═══════════════════════════════════════ */

/* GET /api/profile/saved-places */
router.get("/saved-places", async (req, res) => {
  try {
    const user = await User.findById(req.user._id, "savedPlaces");
    res.json({ savedPlaces: user.savedPlaces || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* POST /api/profile/saved-places  — bookmark a destination */
router.post("/saved-places", async (req, res) => {
  try {
    const { name, tag, img } = req.body;
    if (!name) return res.status(400).json({ error: "name is required." });

    const user = await User.findById(req.user._id);
    if (!user.savedPlaces) user.savedPlaces = [];
    
    const already = user.savedPlaces.find((p) => p.name === name);
    if (already) return res.status(400).json({ error: "Place already saved." });

    user.savedPlaces.push({ name, tag, img });
    await user.save();

    res.status(201).json({ message: "Place saved.", savedPlaces: user.savedPlaces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* DELETE /api/profile/saved-places/:placeId  — remove bookmark (✕ button) */
router.delete("/saved-places/:placeId", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedPlaces) {
      return res.json({ message: "Place removed.", savedPlaces: [] });
    }
    
    user.savedPlaces = user.savedPlaces.filter(
      (p) => p._id && p._id.toString() !== req.params.placeId
    );
    await user.save();
    res.json({ message: "Place removed.", savedPlaces: user.savedPlaces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// const Trip = await Trip.create({
//   userId: req.user._id,
//   title: title || "Custom Trip",
//   destination: city || "Unknown",
//   days: days,
//   itinerary: Object.values(itinerary || {}),
//   totalTripCost: totalCost || 0,
//   status: "upcoming"
// });

/* ═══════════════════════════════════════
   PERSONALIZATION & PREFERENCES
═══════════════════════════════════════ */

/* POST /api/profile/preferences/track — track skip/visit to learn weights */
router.post("/preferences/track", async (req, res) => {
  try {
    const { category, action } = req.body; // action: 'skip', 'visit'
    if (!category || !action) {
      return res.status(400).json({ error: "category and action are required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.preferences.categoryWeights) {
      user.preferences.categoryWeights = new Map();
    }

    const currentWeight = user.preferences.categoryWeights.get(category) || 0;
    
    if (action === "skip") {
      // Decrease weight
      user.preferences.categoryWeights.set(category, currentWeight - 0.5);
      
      // If skipped many times, consider avoiding
      if (currentWeight < -3 && !user.preferences.avoidedCategories.includes(category)) {
        user.preferences.avoidedCategories.push(category);
      }
    } else if (action === "visit") {
      // Increase weight
      user.preferences.categoryWeights.set(category, currentWeight + 1.0);
      
      // Remove from avoided if they actually visited it
      user.preferences.avoidedCategories = user.preferences.avoidedCategories.filter(c => c !== category);
      
      // Add to interests if not there
      if (!user.preferences.interests.includes(category)) {
        user.preferences.interests.push(category);
      }
    }

    await user.save();
    res.json({ message: "Preference tracked.", preferences: user.preferences });
  } catch (err) {
    console.error("TRACK PREFERENCE ERROR:", err);
    res.status(500).json({ error: "Server error tracking preference." });
  }
});

/* PUT /api/profile/preferences — bulk update preferences */
router.put("/preferences", async (req, res) => {
  try {
    const { interests, preferredBudget } = req.body;
    const user = await User.findById(req.user._id);
    
    if (interests) user.preferences.interests = interests;
    if (preferredBudget) user.preferences.preferredBudget = preferredBudget;
    
    await user.save();
    res.json({ message: "Preferences updated.", preferences: user.preferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating preferences." });
  }
});

module.exports = router;