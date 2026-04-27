const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendUpdateEmail } = require("../services/emailService");
const { protect } = require("../middleware/protect");

// GET /api/notifications - Get user notifications
router.get("/", protect, async (req, res) => {
  try {
    // Fetch notifications specifically for this user OR global broadcasts (userId: null)
    const notifications = await Notification.find({
      $or: [
        { userId: req.user._id },
        { userId: null }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// Admin route to trigger a website update notification
router.post("/broadcast", protect, async (req, res) => {
  // Check if admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { title, message, type, link, sendEmail } = req.body;

  try {
    // 1. Create in-app notification for all users (global)
    await Notification.create({
      title,
      message,
      type: type || "info",
      link,
      userId: null // Global broadcast
    });

    // 2. Optional: Send emails if requested
    if (sendEmail) {
      const users = await User.find({ "preferences.emailAlerts": true });
      const emails = users.map(u => u.email).filter(e => e);
      if (emails.length > 0) {
        await sendUpdateEmail(emails, title, message);
      }
    }

    res.json({ success: true, message: "Broadcast sent successfully" });

  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).json({ error: "Failed to send broadcast" });
  }
});

module.exports = router;