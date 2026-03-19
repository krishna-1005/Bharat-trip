const admin = require("../firebaseAdmin");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const firebaseUid = decoded.uid;
    const email = decoded.email;

    let user = await User.findOne({ email });

    // if user does not exist → create
    if (!user) {

      user = await User.create({
        firebaseUid: firebaseUid,
        email: email,
        name: decoded.name || "User",
        photo: decoded.picture || ""
      });

    }

    req.user = user;

    next();

    } catch (err) {

    console.error(err);

    res.status(401).json({ error: "Invalid Firebase token" });

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