const express = require("express");
const User = require("../models/User");
const UsageLog = require("../models/UsageLog");
const Trip = require("../models/Trip");
const ProjectReview = require("../models/ProjectReview");
const Poll = require("../models/Poll");
const { protect, adminOnly } = require("../middleware/protect");

const router = express.Router();

// Only you can access this - Hardcoded for maximum security
const ADMIN_EMAIL = "krishkulkarni2005@gmail.com";

// Middleware to double check admin email
const verifyAdminEmail = (req, res, next) => {
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Access denied. Extreme security active." });
  }
  next();
};

/* GET /api/admin/stats - Summary of all activity */
router.get("/stats", protect, verifyAdminEmail, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalUsageLogs = await UsageLog.countDocuments();
    const totalSavedTrips = await Trip.countDocuments();
    const totalReviews = await ProjectReview.countDocuments();
    const totalPolls = await Poll.countDocuments();

    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsage = await UsageLog.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentReviews = await ProjectReview.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      summary: {
        totalRegisteredUsers: totalUsers,
        totalPlansGenerated: totalUsageLogs,
        totalTripsSavedByUsers: totalSavedTrips,
        totalReviews,
        totalPolls
      },
      recentRegisteredUsers: recentUsers,
      recentActivityLogs: recentUsage,
      recentReviews
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* USERS MANAGEMENT */
router.get("/users", protect, verifyAdminEmail, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.patch("/users/:id/role", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error updating role" });
  }
});

/* REVIEWS MODERATION */
router.get("/reviews", protect, verifyAdminEmail, async (req, res) => {
  try {
    const reviews = await ProjectReview.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

router.delete("/reviews/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    await ProjectReview.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting review" });
  }
});

/* CONTENT CLEANUP */
router.delete("/polls/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    await Poll.findOneAndDelete({ pollId: req.params.id });
    res.json({ message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting poll" });
  }
});

module.exports = router;
