const express = require("express");
const User    = require("../models/User");
const Trip    = require("../models/Trip");
const protect = require("../middleware/protect");

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
    console.log("REQ USER:",req.user);
    const { title, city, days, budget, interests, itinerary, totalCost, image, location, dates } = req.body;

    if (!title || !days)
      return res.status(400).json({ error: "title and days are required." });

    const trip = await Trip.create({

      userId: req.user._id,

      title: title || "Custom Trip",

      destination: city || "Unknown",

      days: days,

      itinerary: Object.values(itinerary || {}),

      totalTripCost: totalCost || 0

    });

    res.status(201).json({ message: "Trip saved.", trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
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

module.exports = router;