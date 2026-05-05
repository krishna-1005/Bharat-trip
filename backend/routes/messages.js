const express = require("express");
const Message = require("../models/Message");
const { protect } = require("../middleware/protect");
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/messages?limit=20&before=<messageId>
router.get("/", protect, async (req, res) => {
  try {
    const { limit = 20, before } = req.query;
    const query = { tripId: req.params.tripId };
    
    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .populate("senderId", "name photo")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
