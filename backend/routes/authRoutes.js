const express = require("express");
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const protect = require("../middleware/protect");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ── SIGNUP ── */
router.post("/signup", async (req, res) => {
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

    res.status(201).json({
      message: "Account created.",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});


/* ── LOGIN ── */
router.post("/login", async (req, res) => {
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
router.put("/change-password", protect, async (req, res) => {
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