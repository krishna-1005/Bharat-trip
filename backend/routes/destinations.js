const express = require("express");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const { suggestDestinations } = require("../services/aiDestinations");
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/destinations — fetch all destination cards
router.get("/", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    res.json(trip.destinations || []);
  } catch (error) {
    console.error("Fetch Destinations Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/destinations — add new destination
router.post("/", protect, async (req, res) => {
  try {
    const { name, country, description, imageUrl, tags, aiScore } = req.body;
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const newDestination = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      country,
      description,
      imageUrl: imageUrl || `https://source.unsplash.com/featured/?${encodeURIComponent(name)}`,
      suggestedBy: {
        userId: req.user._id.toString(),
        name: req.user.name || "Traveller"
      },
      tags: tags || [],
      aiScore: aiScore || 0,
      status: 'suggested',
      upvotes: [],
      downvotes: [],
      createdAt: new Date()
    };

    trip.destinations.push(newDestination);
    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("destination:added", newDestination);
    }

    res.status(201).json(newDestination);
  } catch (error) {
    console.error("Add Destination Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/destinations/:id/vote — toggle upvote or downvote
router.post("/:id/vote", protect, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const userId = req.user._id.toString();
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const dest = trip.destinations.find(d => d.id === req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });

    // Handle toggling
    if (voteType === 'up') {
      const upIdx = dest.upvotes.indexOf(userId);
      if (upIdx > -1) {
        dest.upvotes.splice(upIdx, 1);
      } else {
        dest.upvotes.push(userId);
        // Remove from downvotes
        const downIdx = dest.downvotes.indexOf(userId);
        if (downIdx > -1) dest.downvotes.splice(downIdx, 1);
      }
    } else if (voteType === 'down') {
      const downIdx = dest.downvotes.indexOf(userId);
      if (downIdx > -1) {
        dest.downvotes.splice(downIdx, 1);
      } else {
        dest.downvotes.push(userId);
        // Remove from upvotes
        const upIdx = dest.upvotes.indexOf(userId);
        if (upIdx > -1) dest.upvotes.splice(upIdx, 1);
      }
    }

    // Update status based on votes (simple leading logic)
    const maxVotes = Math.max(...trip.destinations.map(d => d.upvotes.length - d.downvotes.length));
    trip.destinations.forEach(d => {
      if (d.status !== 'locked') {
        const score = d.upvotes.length - d.downvotes.length;
        d.status = (score === maxVotes && score > 0) ? 'leading' : 'suggested';
      }
    });

    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("destination:voted", { 
        id: req.params.id, 
        upvotes: dest.upvotes, 
        downvotes: dest.downvotes,
        allDestinations: trip.destinations // For status updates
      });
    }

    res.json(dest);
  } catch (error) {
    console.error("Vote Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/trips/:tripId/destinations/:id/lock — lock destination (creator only)
router.put("/:id/lock", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Auth: only trip owner
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only trip creator can lock destination" });
    }

    const dest = trip.destinations.find(d => d.id === req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });

    // Unlock others, lock this one
    trip.destinations.forEach(d => {
      d.status = d.id === req.params.id ? 'locked' : 'suggested';
    });

    // Update trip main destination
    trip.destination = dest.name;
    
    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("destination:locked", dest);
    }

    res.json(dest);
  } catch (error) {
    console.error("Lock Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/trips/:tripId/destinations/:id — remove suggestion
router.delete("/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const destIdx = trip.destinations.findIndex(d => d.id === req.params.id);
    if (destIdx === -1) return res.status(404).json({ error: "Destination not found" });

    const dest = trip.destinations[destIdx];
    // Auth: creator or suggester
    if (trip.userId.toString() !== req.user._id.toString() && dest.suggestedBy.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this suggestion" });
    }

    trip.destinations.splice(destIdx, 1);
    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("destination:deleted", req.params.id);
    }

    res.json({ message: "Destination deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// AI Suggestions Route
router.post("/ai-suggest", protect, async (req, res) => {
  try {
    const { groupSize, budget, travelStyle, vibeTags } = req.body;
    const suggestions = await suggestDestinations({ groupSize, budget, travelStyle, vibeTags });
    res.json(suggestions);
  } catch (error) {
    console.error("AI Suggest Route Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
