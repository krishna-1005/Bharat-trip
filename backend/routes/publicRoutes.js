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

/* GET /api/public/featured-trips - Community favorites */
router.get("/featured-trips", async (req, res) => {
  try {
    const trips = await Trip.find({})
      .sort({ createdAt: -1 })
      .limit(6);
    
    // Enrich with a dummy "likes" or "saves" for premium feel
    const enriched = trips.map(t => ({
      id: t._id,
      title: t.title,
      destination: t.destination,
      days: t.days,
      cost: t.totalTripCost,
      saves: Math.floor(Math.random() * 500) + 100,
      image: t.image || `https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80`,
      itinerary: t.itinerary
    }));

    res.json({ trips: enriched });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch featured trips" });
  }
});

module.exports = router;
