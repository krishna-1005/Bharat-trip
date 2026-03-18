const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");
const { v4: uuidv4 } = require("uuid");
const protect = require("../middleware/protect");

// Create a new poll
router.post("/create", async (req, res) => {
  try {
    const { tripName, options, groupSize } = req.body;
    if (!tripName || !options || options.length < 2) {
      return res.status(400).json({ error: "Trip name and at least 2 options are required." });
    }

    const pollId = uuidv4().substring(0, 8);
    const newPoll = new Poll({
      pollId,
      tripName,
      groupSize: groupSize || 3,
      options: options.map(opt => ({ name: opt, votes: 0 })),
      // Optional: createdBy could be added if user is logged in
    });

    await newPoll.save();
    res.status(201).json({ pollId });
  } catch (error) {
    console.error("Poll Creation Error:", error);
    res.status(500).json({ error: "Server error creating poll." });
  }
});

// Get poll details
router.get("/:pollId", async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollId: req.params.pollId });
    if (!poll) return res.status(404).json({ error: "Poll not found." });
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching poll." });
  }
});

// Submit a vote
router.post("/vote", async (req, res) => {
  try {
    const { pollId, optionName } = req.body;
    const poll = await Poll.findOne({ pollId });
    if (!poll) return res.status(404).json({ error: "Poll not found." });

    if (poll.isClosed) {
      return res.status(400).json({ error: "This poll is already closed." });
    }

    const option = poll.options.find(opt => opt.name === optionName);
    if (!option) return res.status(400).json({ error: "Option not found." });

    option.votes += 1;

    // Calculate majority logic based on total group size
    // Majority is > 50% of the entire group size
    const winnerOption = poll.options.find(opt => opt.votes > poll.groupSize / 2);
    
    if (winnerOption) {
      poll.isClosed = true;
      poll.winner = winnerOption.name;
    }

    await poll.save();

    res.json({ message: "Vote recorded successfully", poll });
  } catch (error) {
    console.error("Voting Error:", error);
    res.status(500).json({ error: "Server error recording vote." });
  }
});

module.exports = router;