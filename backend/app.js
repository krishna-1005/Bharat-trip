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
    origin: true, // Reflect request origin back
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

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
    status: "GoTripo API running 🚀"
  });
});

/* ── ping route ── */
app.get("/ping", (req, res) => {
  res.status(200).send("GoTripo server alive 🚀");
});

// 404 Handler with CORS support
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", message: "The requested API route does not exist." });
});

module.exports = app;