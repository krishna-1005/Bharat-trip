const express = require("express");
const Itinerary = require("../models/Itinerary");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/itinerary
router.get("/", protect, async (req, res) => {
  try {
    let itinerary = await Itinerary.findOne({ tripId: req.params.tripId })
      .populate("days.events.ownerId", "name photo");
    
    if (!itinerary) {
      itinerary = await Itinerary.create({ tripId: req.params.tripId, days: [] });
    }
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/itinerary/event
router.post("/event", protect, async (req, res) => {
  try {
    const { date, time, name, description, ownerId, status, linkedPollId } = req.body;
    let itinerary = await Itinerary.findOne({ tripId: req.params.tripId });
    
    if (!itinerary) {
      itinerary = new Itinerary({ tripId: req.params.tripId, days: [] });
    }

    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    let day = itinerary.days.find(d => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === eventDate.getTime();
    });

    if (!day) {
      day = { date: eventDate, events: [] };
      itinerary.days.push(day);
      // Sort days by date
      itinerary.days.sort((a, b) => new Date(a.date) - new Date(b.date));
      // Refetch day after sort if needed, or just find it again
      day = itinerary.days.find(d => new Date(d.date).getTime() === eventDate.getTime());
    }

    day.events.push({ time, name, description, ownerId, status, linkedPollId });
    await itinerary.save();
    
    const updatedItinerary = await Itinerary.findById(itinerary._id).populate("days.events.ownerId", "name photo");
    req.app.get("io").to(req.params.tripId).emit("itinerary:updated", updatedItinerary);
    
    res.status(201).json(updatedItinerary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/trips/:tripId/itinerary/event/:eventId
router.patch("/event/:eventId", protect, async (req, res) => {
  try {
    const { tripId, eventId } = req.params;
    const updates = req.body;
    
    const itinerary = await Itinerary.findOne({ tripId });
    if (!itinerary) return res.status(404).json({ error: "Itinerary not found" });

    let eventFound = false;
    for (let day of itinerary.days) {
      const event = day.events.id(eventId);
      if (event) {
        Object.assign(event, updates);
        eventFound = true;
        break;
      }
    }

    if (!eventFound) return res.status(404).json({ error: "Event not found" });

    await itinerary.save();
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/trips/:tripId/itinerary/event/:eventId
router.delete("/event/:eventId", protect, async (req, res) => {
  try {
    const { tripId, eventId } = req.params;
    const itinerary = await Itinerary.findOne({ tripId });
    if (!itinerary) return res.status(404).json({ error: "Itinerary not found" });

    let eventFound = false;
    for (let day of itinerary.days) {
      const initialLength = day.events.length;
      day.events = day.events.filter(e => e._id.toString() !== eventId);
      if (day.events.length < initialLength) {
        eventFound = true;
        break;
      }
    }

    if (!eventFound) return res.status(404).json({ error: "Event not found" });

    await itinerary.save();
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
