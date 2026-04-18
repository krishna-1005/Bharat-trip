const express = require("express");
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const UsageLog = require("../models/UsageLog");
const { protect } = require("../middleware/protect");
const { authLimiter } = require("../middleware/rateLimiter");
const { signupValidation, loginValidation } = require("../middleware/validator");
const { sendWelcomeEmail } = require("../services/emailService");

const router = express.Router();

const signToken = (id) => {
  // Fallback to a hardcoded key if environment variable is missing
  const secret = process.env.JWT_SECRET || "gotripo_temporary_secret_key_12345";
  
  if (!process.env.JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET is missing from environment variables. Using temporary fallback.");
  }
  
  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

/* ── SIGNUP ── */
router.post("/signup", authLimiter, signupValidation, async (req, res) => {
  try {

    const { name, email, password } = req.body;


    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required." });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already registered." });

    const user = await User.create({
      name,
      email,
      password,
      // firebaseUid: null
    });

    const token = signToken(user._id);

    // Send welcome email (background)
    sendWelcomeEmail(user.email, user.name).catch(e => console.error("Welcome email error:", e.message));

    res.status(201).json({
      message: "Account created.",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      error: "Registration failed. Please try again later.",
      // stack: err.stack // Removed for security/cleanliness
    });
  }
});


/* ── LOGIN ── */
router.post("/login", authLimiter, loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({ error: "Invalid credentials." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials." });

    const token = signToken(user._id);

    // Log the login (background)
    UsageLog.create({
      action: "login",
      userId: user._id,
      isGuest: false,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    }).catch(e => console.error("Login log error:", e.message));

    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error." });
  }
});


/* ── CHANGE PASSWORD ── */
router.put("/change-password", protect, authLimiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both passwords are required." });

    if (newPassword.length < 6)
      return res.status(400).json({ error: "New password must be at least 6 characters." });

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect." });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;