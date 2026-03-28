const admin = require("../firebaseAdmin");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let user = null;

    try {
      // 1. Try Firebase Token First
      const decoded = await admin.auth().verifyIdToken(token);
      const email = decoded.email;

      user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          firebaseUid: decoded.uid,
          email: email,
          name: decoded.name || "User",
          photo: decoded.picture || ""
        });
      }
    } catch (firebaseErr) {
      // 2. Try Custom JWT Token
      try {
        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (jwtErr) {
        // Log both errors for debugging, but be concise
        console.warn(`Auth failed. Firebase: ${firebaseErr.message.substring(0, 100)}... JWT: ${jwtErr.message}`);
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
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

module.exports = { protect, adminOnly };
