const express      = require("express");
const generatePlan = require("../logic/planner");
const { protect } = require("../middleware/protect");
const Trip         = require("../models/Trip");
const UsageLog     = require("../models/UsageLog");
const { admin } = require("../firebaseAdmin");
const User         = require("../models/User");
const jwt          = require("jsonwebtoken");
const { planValidation } = require("../middleware/validator");

const router = express.Router();

/* ── Generate Trip Plan ── */
router.post("/generate", planValidation, async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body missing" });
  }

  const { city, cities, days, budget, interests, isMultiCity, travelerType, pace } = req.body;

  if (!days || !budget) {
    return res.status(400).json({ error: "days and budget are required" });
  }

  try {
    let userPreferences = {};
    let loggedUserId = null;

    // Auth handling
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        const userObj = await User.findOne({ email: decoded.email });
        if (userObj) {
          loggedUserId = userObj._id;
          userPreferences = userObj.preferences || {};
        }
      } catch (e) { 
        try {
          if (process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userObj = await User.findById(decoded.id);
            if (userObj) {
              loggedUserId = userObj._id;
              userPreferences = userObj.preferences || {};
            }
          }
        } catch (jwtErr) {}
      }
    }

    // Usage Log
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      await UsageLog.create({
        action: "generate_plan",
        userId: loggedUserId,
        isGuest: !loggedUserId,
        details: { city, cities, days, budget, interests },
        ipAddress: ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {}

    let finalPlan;

    if (isMultiCity && Array.isArray(cities) && cities.length > 0) {
      // SMART MULTI-CITY LOGIC
      const daysPerCity = Math.floor(days / cities.length);
      const allItineraries = [];
      let totalTripCost = 0;
      let dayCounter = 1;

      for (let i = 0; i < cities.length; i++) {
        const currentCityDays = (i === cities.length - 1) ? (days - (daysPerCity * (cities.length - 1))) : daysPerCity;
        if (currentCityDays <= 0) continue;

        const cityPlan = await generatePlan({
          city: cities[i],
          days: currentCityDays,
          budget: budget / cities.length,
          interests: interests || [],
          travelerType: travelerType || "solo",
          pace: pace || "moderate",
          userPreferences,
          language: req.body.language || "English"
        });

        // Remap days to be continuous and add city labels
        cityPlan.itinerary.forEach(d => {
          allItineraries.push({
            ...d,
            day: dayCounter,
            title: d.title || `Exploring ${cities[i]}`,
            theme: d.theme || `Vibes of ${cities[i]}`,
            // Ensure places know which city they belong to
            places: d.places.map(p => ({ ...p, city: cities[i] }))
          });
          dayCounter++;
        });
        totalTripCost += cityPlan.totalTripCost;
      }

      finalPlan = {
        city: cities.join(" → "),
        days: parseInt(days),
        itinerary: allItineraries,
        totalTripCost,
        totalBudget: budget,
        summary: `A multi-city adventure through ${cities.join(", ")}.`
      };
    } else {
      // SINGLE CITY LOGIC
      finalPlan = await generatePlan({
        city: city || "Bengaluru",
        days: parseInt(days),
        budget,
        interests: interests || [],
        travelerType: travelerType || "solo",
        pace: pace || "moderate",
        userPreferences,
        language: req.body.language || "English"
      });
    }

    const destinationTitle = isMultiCity && Array.isArray(cities) ? cities.join(" → ") : finalPlan.city;

    // Save to DB
    const savedTrip = await Trip.create({
      userId: loggedUserId,
      isGuest: !loggedUserId,
      title: `${destinationTitle} ${isMultiCity ? 'Journey' : 'Plan'}`,
      destination: destinationTitle,
      days: finalPlan.days,
      itinerary: finalPlan.itinerary,
      totalTripCost: finalPlan.totalTripCost,
      totalBudget: finalPlan.totalBudget,
      summary: finalPlan.summary,
      travelerType: travelerType || "solo",
      pace: pace || "moderate",
      status: "upcoming"
    });

    res.json({ plan: savedTrip });

  } catch (err) {
    console.error("Plan generation error:", err);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

/* ── Delete Trip ── */
router.delete("/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await trip.deleteOne();
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
