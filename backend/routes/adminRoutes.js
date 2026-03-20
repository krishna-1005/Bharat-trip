const express = require("express");
const User = require("../models/User");
const UsageLog = require("../models/UsageLog");
const Trip = require("../models/Trip");
const ProjectReview = require("../models/ProjectReview");
const Poll = require("../models/Poll");
const { protect, adminOnly } = require("../middleware/protect");

const router = express.Router();

// Only you can access this - Hardcoded for maximum security
const ADMIN_EMAILS = ["bharattrip@gmail.com"];

// Middleware to double check admin email
const verifyAdminEmail = async (req, res, next) => {
  const userEmail = req.user?.email?.toLowerCase();
  const authorized = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail);
  
  console.log(`Admin Access Attempt by: ${userEmail}`);
  
  if (!authorized) {
    console.log(`Access Denied: ${userEmail} is not in the authorized list.`);
    return res.status(403).json({ error: "Access denied. Extreme security active." });
  }

  // Ensure user also has admin role in DB for other middleware (adminOnly)
  if (req.user && req.user.role !== "admin") {
    req.user.role = "admin";
    await req.user.save();
    console.log(`Auto-promoted ${userEmail} to admin role in database.`);
  }

  next();
};

/* GET /api/admin/whoami - Debug identity */
router.get("/whoami", protect, (req, res) => {
  res.json({ email: req.user?.email, role: req.user?.role });
});

const SystemConfig = require("../models/SystemConfig");

/* GET /api/admin/config/public - Publicly accessible site config */
router.get("/config/public", async (req, res) => {
  try {
    const configs = await SystemConfig.find() || [];
    // Convert array to a simple object for easier frontend use
    const configMap = {};
    if (Array.isArray(configs)) {
      configs.forEach(c => {
        if (c && c.key) configMap[c.key] = c.value;
      });
    }
    res.json(configMap);
  } catch (err) {
    console.error("Public config fetch error:", err);
    // Return empty object instead of 500 to prevent frontend crashes
    res.json({});
  }
});

/* GET /api/admin/config - Get site-wide config (Admin Only) */
router.get("/config", protect, verifyAdminEmail, async (req, res) => {
  try {
    const configs = await SystemConfig.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching config" });
  }
});

/* POST /api/admin/config - Update specific config (e.g., homepage_images) */
router.post("/config", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { key, value } = req.body;
    const config = await SystemConfig.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Error updating config" });
  }
});

/* POST /api/admin/broadcast - Simulate a global system broadcast */
router.post("/broadcast", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { message } = req.body;
    // In a real app, this might send a socket.io event or email
    console.log(`[GLOBAL BROADCAST] ${message}`);
    res.json({ message: "Broadcast signal sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Broadcast failure" });
  }
});

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
