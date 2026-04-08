const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const tripRoutes    = require("./routes/tripRoutes");
const planRoutes    = require("./routes/planRoutes");
const chatRoutes    = require("./routes/chatRoutes");
const authRoutes    = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const nearbyPlaces = require("./routes/nearbyPlaces");
const placeRoutes = require("./routes/placeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const projectReviewRoutes = require("./routes/projectReviewRoutes");
const pollRoutes = require("./routes/pollRoutes");
const publicRoutes = require("./routes/publicRoutes");

// Per-environment CORS configuration
const app = express();
const maintenanceMode = require("./middleware/maintenance");

// More permissive CORS for troubleshooting
app.use(
  cors({
    origin: true, // Reflect request origin back to allow any origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Explicitly handle preflight for all routes
app.options("/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

app.use(express.json());
app.use(maintenanceMode);

/* ── MongoDB Connection ── */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

/* ── routes ── */
app.use("/api/plan", planRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/nearby", nearbyPlaces);
app.use("/api/places", placeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", projectReviewRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/public", publicRoutes);

// health check
app.get("/", (req, res) => {
  res.json({
    status: "Bharat Trip API running 🚀"
  });
});

/* ── ping route (keeps server awake) ── */
app.get("/ping", (req, res) => {
  res.status(200).send("BharatTrip server alive 🚀");
});

module.exports = app;