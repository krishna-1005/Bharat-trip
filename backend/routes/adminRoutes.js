const express = require("express");
const User = require("../models/User");
const UsageLog = require("../models/UsageLog");
const Trip = require("../models/Trip");
const protect = require("../middleware/protect");

const router = express.Router();

// Only you can access this
const ADMIN_EMAIL = "krishkulkarni2005@gmail.com";

/* GET /api/admin/stats - Summary of all activity */
router.get("/stats", protect, async (req, res) => {
  try {
    // SECURITY CHECK: Only allow your specific email
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    // 1. Get counts
    const totalUsers = await User.countDocuments();
    const totalUsageLogs = await UsageLog.countDocuments();
    const totalSavedTrips = await Trip.countDocuments();

    // 2. Get recent registered users
    const recentUsers = await User.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // 3. Get recent usage logs (including anonymous)
    const recentUsage = await UsageLog.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalRegisteredUsers: totalUsers,
        totalPlansGenerated: totalUsageLogs,
        totalTripsSavedByUsers: totalSavedTrips
      },
      recentRegisteredUsers: recentUsers,
      recentActivityLogs: recentUsage
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
