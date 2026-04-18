const express = require("express");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const supplierOrchestrator = require("../services/supplierOrchestrator");

const router = express.Router();

/* SAVE TRIP */
router.post("/", protect, async (req, res) => {
  try {

    const { title, destination, days, itinerary, isPublic, image, ...rest } = req.body;

    const trip = await Trip.create({
      userId: req.user._id,
      isGuest: false,
      title,
      destination,
      days,
      itinerary,
      isPublic: isPublic || false,
      image: image || "",
      ...rest
    });

    console.log(`[TRIP CREATED] User: ${req.user.email}, isGuest: ${trip.isGuest}`);
    res.status(201).json(trip);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while saving trip" });
  }
});

/* LIKE TRIP */
router.post("/:id/like", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const index = trip.likes.indexOf(req.user._id);
    if (index === -1) {
      trip.likes.push(req.user._id);
    } else {
      trip.likes.splice(index, 1);
    }

    await trip.save();
    res.json({ likes: trip.likes.length, isLiked: trip.likes.includes(req.user._id) });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* GET USER TRIPS */
router.get("/", protect, async (req, res) => {
  try {

    const trips = await Trip.find({ userId: req.user._id });

    res.json(trips);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* GET TRIP BY ID (PUBLIC) */
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* EXECUTE REBOOKING REVISION */
router.post("/:id/execute-revision", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || !trip.pendingRevision) {
      return res.status(404).json({ error: "Trip or pending revision not found" });
    }

    console.log(`⚡ Executing rebooking for Trip ${trip._id}`);

    // 1. Commit the revision
    trip.itinerary = trip.pendingRevision.itinerary;
    
    // 2. Clear revision data
    trip.pendingRevision = undefined;

    // 3. Fire the Orchestrator (dispatch emails/API calls)
    await supplierOrchestrator.executeNotifications(trip);

    await trip.save();

    res.json({ success: true, message: "Rebooking blueprint executed successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error executing rebooking" });
  }
});

module.exports = router;