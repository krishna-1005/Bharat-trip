const express = require("express");
const router = express.Router();
const UsageLog = require("../models/UsageLog");
const Trip = require("../models/Trip");
const JobApplication = require("../models/JobApplication");
const { db } = require("../firebaseAdmin");
const { sendJobApplicationNotification } = require("../services/emailService");

const fs = require("fs");
const path = require("path");

let firestoreEnabled = true;

/* ── HELPER: Load India Places Data ── */
const loadIndiaPlaces = () => {
  try {
    const dataPath = path.join(__dirname, "../data/indiaPlaces.json");
    const rawData = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(rawData);
  } catch (err) {
    console.error("Error loading indiaPlaces.json:", err);
    return [];
  }
};

/* ── EXPLORE PLACES ── */
router.get("/explore-places", async (req, res) => {
  try {
    const { q, category } = req.query;
    const allCities = loadIndiaPlaces();
    
    let results = [];

    // Flatten all places into a single list with city info
    allCities.forEach(cityData => {
      cityData.places.forEach(place => {
        results.push({
          ...place,
          id: place.name.toLowerCase().replace(/\s+/g, "-"),
          city: cityData.city,
          img: `https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80`, // Fallback image
        });
      });
    });

    // Filter by query if provided
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.city.toLowerCase().includes(query) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    // Filter by category if provided
    if (category && category !== "All") {
      const cat = category.toLowerCase();
      results = results.filter(p => 
        p.category.toLowerCase() === cat ||
        (p.tags && p.tags.some(t => t.toLowerCase() === cat))
      );
    }

    // Sort by rating and reviews for relevance
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    res.json(results.slice(0, 50)); // Return top 50 matches
  } catch (err) {
    console.error("Explore places error:", err);
    res.status(500).json({ error: "Failed to fetch explore places" });
  }
});

/* ── CAREERS ── */
router.post("/careers/apply", async (req, res) => {
  try {
    const { name, email, resume, note, jobId, jobTitle } = req.body;
    const application = await JobApplication.create({
      name,
      email,
      resume,
      note,
      jobId,
      jobTitle,
    });
    
    // Notify admin
    await sendJobApplicationNotification(application);

    res.status(201).json({ success: true, application });
  } catch (err) {
    console.error("Application error:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

/* ── TRACKING ── */
router.post("/track", async (req, res) => {
  try {
    const { userId, userType, guestId, action, details } = req.body;
    
    // id can be userId (if logged in) or guestId (if guest)
    const id = userId || guestId;
    if (!id) return res.status(400).json({ error: "No ID provided" });

    // 1. Log to UsageLog (MongoDB) for Live Feed
    UsageLog.create({
      action: action || "site_access",
      userId: userId || null,
      isGuest: !userId,
      details: { ...details, guestId },
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    }).catch(e => console.error("UsageLog error:", e.message));

    if (!db || !firestoreEnabled) {
      console.warn("Tracking skipped: Firestore not available or disabled due to auth error.");
      return res.status(200).json({ success: false, message: "Firestore not available" });
    }

    const userRef = db.collection("users").doc(id);
    let doc;
    try {
      doc = await userRef.get();
    } catch (dbErr) {
      if (dbErr.code === 16 || dbErr.message.includes("UNAUTHENTICATED")) {
        console.error("❌ Firestore Authentication Error. Disabling tracking.");
        firestoreEnabled = false;
        return res.status(200).json({ success: false, message: "Tracking disabled due to auth error" });
      }
      throw dbErr; // Re-throw other DB errors to be caught by outer catch
    }

    if (!doc.exists) {
      // Create new tracking doc
      await userRef.set({
        userId: id,
        userType: userType || "guest",
        actionsCount: 1,
        createdAt: new Date(),
        lastActive: new Date(),
        converted: false,
        email: req.body.email || null,
        lastAction: action || "init"
      });
    } else {
      // Update existing
      const data = doc.data();
      const updates = {
        actionsCount: (data.actionsCount || 0) + 1,
        lastActive: new Date(),
        lastAction: action || data.lastAction
      };
      
      if (req.body.email) updates.email = req.body.email;

      // Handle conversion: guest -> user
      if (userType === "user" && data.userType === "guest") {
        updates.userType = "user";
        updates.converted = true;
        updates.originalGuestId = data.userId;
      }

      await userRef.update(updates);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Tracking error:", err);
    res.status(500).json({ error: "Failed to track activity" });
  }
});

/* GET /api/public/recent-activity - Real-time planning pulse */
router.get("/recent-activity", async (req, res) => {
  try {
    // 1. Try to get recent plan generations from usage logs
    const recentLogs = await UsageLog.find({ action: "generate_plan" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .catch(() => []); // Silent fallback for DB errors

    // 2. Map them to a cleaner format
    let activity = recentLogs.map(log => {
      const city = log.details?.city || "a city";
      const time = log.createdAt || new Date();
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
        .limit(10)
        .lean()
        .catch(() => []);
      
      activity = recentTrips.map(trip => ({
        id: trip._id,
        city: trip.destination || "Discovery",
        user: "Someone",
        time: trip.createdAt || new Date(),
        type: "Premium"
      }));
    }

    res.json({ activity: activity.slice(0, 3) });
  } catch (err) {
    console.error("Public activity API error:", err.message);
    res.json({ activity: [] }); // Never 500 here
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
      .limit(6)
      .lean()
      .catch(() => []);
    
    // If not enough public trips, just get any recent ones for now
    let finalTrips = trips;
    if (trips.length < 3) {
      const recent = await Trip.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .lean()
        .catch(() => []);
      finalTrips = recent;
    }

    const enriched = finalTrips.map(t => ({
      id: t._id,
      title: t.title || `${t.destination} Odyssey`,
      destination: t.destination,
      days: t.days,
      cost: t.totalTripCost || 0,
      saves: t.savesCount || Math.floor(Math.random() * 500) + 100,
      image: t.image || `https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80`,
      itinerary: t.itinerary || [],
      views: t.views || 0,
      likes: t.likes ? t.likes.length : 0
    }));

    res.json({ trips: enriched });
  } catch (err) {
    console.error("Featured trips error:", err.message);
    res.json({ trips: [] });
  }
});

module.exports = router;
