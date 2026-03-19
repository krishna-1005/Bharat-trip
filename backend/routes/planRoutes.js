const express      = require("express");
const generatePlan = require("../logic/planner");
const { protect } = require("../middleware/protect");
const Trip         = require("../models/Trip");
const UsageLog     = require("../models/UsageLog");
const admin        = require("../firebaseAdmin");
const User         = require("../models/User");

const router = express.Router();

/* ── Generate Trip Plan ── */
router.post("/generate", async (req, res) => {        // ✅ async added

  if (!req.body) {
    return res.status(400).json({ error: "Request body missing" });
  }

  const { city, days, budget, interests } = req.body;

  if (!days || !budget) {
    return res.status(400).json({ error: "days and budget are required" });
  }

  try {
    // Attempt to log the planner usage to MongoDB
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      let loggedUserId = null;

      // Check if user is logged in (optional auth for logging)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = await admin.auth().verifyIdToken(token);
          const userObj = await User.findOne({ email: decoded.email });
          if (userObj) loggedUserId = userObj._id;
        } catch (e) { /* ignore invalid token for simple logging */ }
      }

      await UsageLog.create({
        action: "generate_plan",
        userId: loggedUserId,
        details: { city, days, budget, interests },
        ipAddress: ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {
      console.error("Failed to save usage log:", logErr.message);
    }

    const plan = await generatePlan({                 // ✅ await added
      city:      city || "Bengaluru",
      days:      parseInt(days),
      budget,
      interests: interests || []
    });

    res.json({ plan });                               // ✅ wrap in { plan } so frontend gets plan.itinerary

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
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;