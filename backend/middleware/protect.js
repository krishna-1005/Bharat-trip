const mongoose = require("mongoose");
const { admin, initialized } = require("../firebaseAdmin");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UsageLog = require("../models/UsageLog");
const { sendWelcomeEmail } = require("../services/emailService");

const verifyTokenHelper = async (token) => {
  if (!token) return null;
  const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

  let user = null;
  let firebaseErr = null;

  try {
    if (initialized) {
      const decoded = await admin.auth().verifyIdToken(cleanToken);
      const email = decoded.email;

      user = await User.findOne({ email });

      if (!user) {
        console.log(`👤 Syncing new Firebase user to MongoDB: ${email}`);
        user = await User.create({
          firebaseUid: decoded.uid,
          email: email,
          name: decoded.name || "User",
          photo: decoded.picture || ""
        });

        // Send welcome email in background
        sendWelcomeEmail(user.email, user.name).catch(err => 
          console.error(`❌ Failed to send welcome email to ${user.email}:`, err.message)
        );
      }
      return user;
    } else {
      throw new Error("Firebase Admin not initialized");
    }
  } catch (err) {
    firebaseErr = err;
  }

  // 2. Try Custom JWT Token
  try {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" && "GoTripo_temporary_secret_key_12345");
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(cleanToken, secret);
    user = await User.findById(decoded.id);
    return user;
  } catch (jwtErr) {
    console.warn(`[AUTH] Verification failed. Firebase: ${firebaseErr?.message || "N/A"} | JWT: ${jwtErr.message}`);
    return null;
  }
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyTokenHelper(token);

    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = user;

    // Background logging (non-blocking)
    setTimeout(() => {
      UsageLog.create({
        action: "site_access",
        userId: user._id,
        isGuest: false,
        details: { path: req.path, method: req.method },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }).catch(err => console.error("Auto-log error:", err.message));
    }, 0);

    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admins only." });
  }
};

module.exports = { protect, adminOnly, verifyTokenHelper };
