const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const tripRoutes    = require("./routes/tripRoutes");
const planRoutes    = require("./routes/planRoutes");
const chatRoutes    = require("./routes/chatRoutes");
const authRoutes    = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const nearbyPlaces = require("./routes/nearbyPlaces");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bharat-trip-opal.vercel.app"
    ],
    credentials: true
  })
);
app.use(express.json());

/* ── MongoDB Connection ── */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

/* ── routes ── */
app.use("/api/plan", planRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/nearby", nearbyPlaces);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/trips", tripRoutes);

module.exports = app;