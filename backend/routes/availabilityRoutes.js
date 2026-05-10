const express = require("express");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const router = express.Router();

/* 1. ADD OPTIONS (Trip Creator Only) */
router.post("/:tripId/availability/options", protect, async (req, res) => {
  try {
    const { options } = req.body; // Array of { startDate, endDate, duration }
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    
    // Check if user is the creator or an organizer
    const isOrganizer = trip.createdBy.toString() === req.user._id.toString() || 
                        trip.members.some(m => m.userId.toString() === req.user._id.toString() && m.role === 'organizer');
    
    if (!isOrganizer) return res.status(403).json({ error: "Only organizers can add date options" });

    trip.availabilityPoll.dateOptions = options.map(opt => ({
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date(opt.startDate),
      endDate: new Date(opt.endDate),
      duration: opt.duration,
      votes: []
    }));
    trip.availabilityPoll.status = 'open';
    trip.availabilityPoll.createdBy = req.user._id;

    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("availability:updated", trip.availabilityPoll);
    }

    res.status(201).json(trip.availabilityPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* 2. VOTE (Members and Guests) */
router.post("/:tripId/availability/vote", async (req, res) => {
  try {
    const { dateOptionId, available, name, userId } = req.body;
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    if (trip.availabilityPoll.status === 'closed') return res.status(400).json({ error: "Poll is closed" });

    const option = trip.availabilityPoll.dateOptions.find(opt => opt.id === dateOptionId);
    if (!option) return res.status(404).json({ error: "Date option not found" });

    // Remove existing vote by this user/name
    option.votes = option.votes.filter(v => 
      (userId && v.userId === userId) || (name && v.name === name) ? false : true
    );

    // Add new vote
    option.votes.push({
      userId: userId || null,
      name: name,
      available: available // 'yes', 'maybe', 'no'
    });

    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("availability:voted", { 
        dateOptionId, 
        vote: { userId, name, available } 
      });
      
      // Check if all members have voted
      const allMembersVoted = trip.members.every(m => 
        trip.availabilityPoll.dateOptions.some(opt => 
          opt.votes.some(v => v.userId?.toString() === m.userId?.toString())
        )
      );

      if (allMembersVoted) {
        io.to(req.params.tripId).emit("availability:allVoted", {
          message: "All members have voted! Time to lock the dates.",
          bestMatchId: trip.availabilityPoll.dateOptions.sort((a, b) => 
            b.votes.filter(v => v.available === 'yes').length - a.votes.filter(v => v.available === 'yes').length
          )[0].id
        });
      }
      
      io.to(req.params.tripId).emit("availability:updated", trip.availabilityPoll);
    }

    res.json(trip.availabilityPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* 3. GET AVAILABILITY */
router.get("/:tripId/availability", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip.availabilityPoll);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* 4. LOCK DATES (Trip Creator Only) */
router.put("/:tripId/availability/lock", protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    
    const isOrganizer = trip.createdBy.toString() === req.user._id.toString() || 
                        trip.members.some(m => m.userId.toString() === req.user._id.toString() && m.role === 'organizer');
    
    if (!isOrganizer) return res.status(403).json({ error: "Only organizers can lock dates" });

    trip.startDate = new Date(startDate);
    trip.endDate = new Date(endDate);
    trip.availabilityPoll.status = 'closed';
    trip.availabilityPoll.finalDates = { startDate: trip.startDate, endDate: trip.endDate };

    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("availability:locked", {
        startDate: trip.startDate,
        endDate: trip.endDate
      });
    }

    res.json({ message: "Dates locked", startDate: trip.startDate, endDate: trip.endDate });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
