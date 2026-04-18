const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Trip = require("../models/Trip");
const rebookingEngine = require("../services/rebookingEngine");

/**
 * POST /api/webhooks/travel-events
 * Ingest real-time data from flight trackers, weather services, etc.
 */
router.post("/travel-events", async (req, res) => {
  try {
    const { tripId, eventType, message, severity, details } = req.body;

    if (!tripId || !eventType) {
      return res.status(400).json({ error: "Missing required fields: tripId and eventType" });
    }

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: "Invalid tripId format. Expected a 24-character hex string." });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    console.log(`📡 Webhook received: ${eventType} for Trip ${tripId}`);

    // 1. Log the alert in the Trip document
    trip.disruptionAlerts.push({
      type: eventType,
      message: message || `Disruption detected: ${eventType}`,
      severity: severity || "medium",
      timestamp: new Date()
    });

    await trip.save();

    // 2. Trigger the Agentic Rebooking Engine (Background)
    // We don't await this to keep the webhook response fast
    rebookingEngine.processDisruption(trip, eventType, details).catch(err => {
      console.error("❌ Rebooking Engine Error:", err.message);
    });

    res.status(200).json({ message: "Event ingested and rebooking calculation started" });

  } catch (error) {
    console.error("Webhook processing error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
