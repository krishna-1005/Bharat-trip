const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/protect");

// All group chat routes require authentication
router.use(protect);

// Get messages for a trip
router.get("/:tripId", async (req, res) => {
  try {
    const messages = await Message.find({ tripId: req.params.tripId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message
router.post("/send", async (req, res) => {
  try {
    const { tripId, text } = req.body;
    if (!tripId || !text) {
      return res.status(400).json({ error: "TripId and text are required" });
    }

    const newMessage = new Message({
      tripId,
      userId: req.user.firebaseUid || req.user._id,
      userName: req.user.name || "Traveller",
      text
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
