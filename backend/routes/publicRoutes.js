const express = require("express");
const router = express.Router();
const UsageLog = require("../models/UsageLog");
const Trip = require("../models/Trip");

/* GET /api/public/recent-activity - Real-time planning pulse */
router.get("/recent-activity", async (req, res) => {
  try {
    // 1. Try to get recent plan generations from usage logs
    const recentLogs = await UsageLog.find({ action: "generate_plan" })
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. Map them to a cleaner format
    let activity = recentLogs.map(log => {
      const city = log.details?.city || "a city";
      const time = log.createdAt;
      // We don't expose full names for privacy, just "Someone" or "A traveler"
      return {
        id: log._id,
        city: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
        user: "A traveler",
        time,
        type: log.details?.interests?.[0] || "Custom"
      };
    });

    // 3. Fallback: If logs are empty, use recent saved trips
    if (activity.length === 0) {
      const recentTrips = await Trip.find({})
        .sort({ createdAt: -1 })
        .limit(10);
      
      activity = recentTrips.map(trip => ({
        id: trip._id,
        city: trip.destination,
        user: "Someone",
        time: trip.createdAt,
        type: "Premium"
      }));
    }

    res.json({ activity });
  } catch (err) {
    console.error("Public activity API error:", err);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

/* GET /api/public/trips - Discovery Page */
router.get("/trips", async (req, res) => {
  try {
    const { city, days, budget, sort } = req.query;
    const filter = { isPublic: true };

    if (city) filter.destination = new RegExp(city, "i");
    if (days) filter.days = parseInt(days);
    if (budget) {
      if (budget === "low") filter.totalBudget = { $lte: 3000 };
      if (budget === "medium") filter.totalBudget = { $gt: 3000, $lte: 10000 };
      if (budget === "high") filter.totalBudget = { $gt: 10000 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "popular") sortOption = { likesCount: -1, views: -1 };
    if (sort === "recent") sortOption = { createdAt: -1 };

    // Use aggregation to get likes count for sorting if needed, or just find
    const trips = await Trip.find(filter)
      .populate("userId", "name photo")
      .sort(sortOption)
      .limit(20);

    res.json({ trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch public trips" });
  }
});

/* GET /api/public/trips/:id - Public Trip View */
router.get("/trips/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("userId", "name photo");
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    // Increment views
    trip.views = (trip.views || 0) + 1;
    await trip.save();

    res.json({ trip });
  } catch (err) {
    console.error("Fetch trip error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET /api/public/featured-trips - Community favorites */
router.get("/featured-trips", async (req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true })
      .sort({ likesCount: -1, views: -1 })
      .limit(6);
    
    // If not enough public trips, just get any recent ones for now
    let finalTrips = trips;
    if (trips.length < 3) {
      finalTrips = await Trip.find({})
        .sort({ createdAt: -1 })
        .limit(6);
    }

    const enriched = finalTrips.map(t => ({
      id: t._id,
      title: t.title,
      destination: t.destination,
      days: t.days,
      cost: t.totalTripCost,
      saves: t.savesCount || Math.floor(Math.random() * 500) + 100,
      image: t.image || `https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80`,
      itinerary: t.itinerary,
      views: t.views || 0,
      likes: t.likes ? t.likes.length : 0
    }));

    res.json({ trips: enriched });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch featured trips" });
  }
});

module.exports = router;
