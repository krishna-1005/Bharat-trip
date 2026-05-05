const express = require("express");
const mongoose = require("mongoose");
const Poll = require("../models/Poll");
const Itinerary = require("../models/Itinerary");
const { protect } = require("../middleware/protect");
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/polls
router.get("/", protect, async (req, res) => {
  try {
    const polls = await Poll.find({ tripId: req.params.tripId })
      .populate("createdBy", "name photo")
      .sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/polls
router.post("/", protect, async (req, res) => {
  try {
    const { question, options, linkedEventId } = req.body;
    const poll = await Poll.create({
      tripId: req.params.tripId,
      question,
      options: options.map(o => ({ text: o, votes: [] })),
      linkedEventId,
      createdBy: req.user._id
    });
    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/polls/:pollId/vote
router.post("/:pollId/vote", protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    if (poll.status === "closed") return res.status(400).json({ error: "Poll is closed" });

    // Remove user's vote from all options first (toggle/re-vote)
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== req.user._id.toString());
    });

    // Add new vote
    if (optionIndex !== undefined && optionIndex >= 0 && optionIndex < poll.options.length) {
      poll.options[optionIndex].votes.push(req.user._id);
    }

    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/polls/:pollId/close
router.post("/:pollId/close", protect, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    poll.status = "closed";
    await poll.save();

    // Also update any linked itinerary events
    const itinerary = await Itinerary.findOne({ tripId: poll.tripId });
    if (itinerary) {
      let changed = false;
      // Find winning option
      let winnerIndex = 0;
      let maxVotes = -1;
      poll.options.forEach((opt, idx) => {
        if (opt.votes.length > maxVotes) {
          maxVotes = opt.votes.length;
          winnerIndex = idx;
        }
      });

      // Simple logic: if index 0 wins, it's confirmed. Otherwise (e.g. "Skip it"), cancelled.
      // This matches the user's screenshot where "Yes, add it" is index 0.
      const newStatus = winnerIndex === 0 ? "confirmed" : "cancelled";

      itinerary.days.forEach(day => {
        day.events.forEach(event => {
          if (event.linkedPollId && event.linkedPollId.toString() === poll._id.toString()) {
            event.status = newStatus;
            event.linkedPollId = undefined; // Unlink once decided
            changed = true;
          }
        });
      });

      if (changed) {
        await itinerary.save();
        const populatedItinerary = await Itinerary.findById(itinerary._id).populate("days.events.ownerId", "name photo");
        req.app.get("io").to(poll.tripId.toString()).emit("itinerary:updated", populatedItinerary);
      }
    }

    req.app.get("io").to(poll.tripId.toString()).emit("poll:updated", poll);
    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
