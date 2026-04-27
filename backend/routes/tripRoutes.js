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

    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });

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

/* JOIN TRIP */
router.post("/:id/join", async (req, res) => {
  try {
    const { userId, userName } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Check if user is already a member
    const isMember = trip.members.some(m => m.userId === userId);
    if (!isMember) {
      trip.members.push({ userId, userName });
      await trip.save();
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
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // If revision already cleared, assume success (idempotency)
    if (!trip.pendingRevision) {
      console.log(`ℹ️ Trip ${trip._id} already has no pending revision. Likely already executed.`);
      return res.json({ success: true, message: "Revision already applied or cleared." });
    }

    console.log(`⚡ Executing rebooking for Trip ${trip._id}`);
    
    // 1. Commit the revision and update costs
    const revision = trip.pendingRevision;
    if (revision && revision.itinerary && revision.itinerary.length > 0) {
      console.log(`📝 Applying salvaged itinerary with ${revision.itinerary.length} days.`);
      
      // Map and ensure we preserve the new AI-calculated times
      const newItinerary = revision.itinerary.map(day => ({
        day: day.day,
        estimatedHours: day.estimatedHours,
        estimatedCost: day.estimatedCost,
        places: day.places.map(p => {
          const po = p.toObject ? p.toObject() : p;
          return {
            ...po,
            bestTime: p.bestTime,
            timeReason: p.timeReason
          };
        })
      }));
      
      // Use trip.set to ensure Mongoose tracks the entire itinerary update
      trip.set('itinerary', newItinerary);
      
      // Recalculate total cost from the new itinerary
      let newTotalCost = 0;
      newItinerary.forEach(day => {
        if (day.places) {
          day.places.forEach(p => {
            newTotalCost += Number(p.estimatedCost || 0);
          });
        }
      });
      trip.totalTripCost = newTotalCost;
    } else {
       console.error(`❌ Rebooking failed: Salvaged itinerary is empty for Trip ${trip._id}`);
       // Safety: clear the corrupted revision without applying
       trip.pendingRevision = undefined;
       await trip.save();
       return res.status(400).json({ error: "Salvaged itinerary was empty. Alert cleared but not applied." });
    }
    
    // 2. Clear revision data ON THE OBJECT so .save() removes it from DB
    trip.set('pendingRevision', undefined);

    // 3. Fire the Orchestrator
    await supplierOrchestrator.executeNotifications(trip);

    await trip.save();
    console.log(`✅ Trip ${trip._id} successfully updated and revision cleared.`);

    res.json({ success: true, message: "Rebooking blueprint executed successfully" });

  } catch (error) {
    console.error("Rebooking Execution Error:", error);
    res.status(500).json({ error: "Server error executing rebooking" });
  }
});

module.exports = router;