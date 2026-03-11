const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendUpdateEmail } = require("../services/emailService");
const protect = require("../middleware/protect");

// Admin route to trigger a website update notification
// In a real app, this should be restricted to admin users only
router.post("/broadcast", async (req, res) => {
  const { subject, content, secretKey } = req.body;

  // Simple security check for this demo
  if (secretKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized broadcast" });
  }

  try {
    // 1. Find all users who want email alerts
    const users = await User.find({ "preferences.emailAlerts": true });
    const emails = users.map(u => u.email).filter(e => e);

    if (emails.length === 0) {
      return res.json({ message: "No users subscribed to alerts." });
    }

    // 2. Send emails
    await sendUpdateEmail(emails, subject, content);

    res.json({ 
      success: true, 
      message: `Broadcast sent to ${emails.length} users.`,
      usersNotified: emails.length
    });

  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).json({ error: "Failed to send broadcast" });
  }
});

module.exports = router;