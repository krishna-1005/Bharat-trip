const express = require("express");
const Trip = require("../models/Trip");
const protect = require("../middleware/protect");

const router = express.Router();

/* SAVE TRIP */
router.post("/", protect, async (req, res) => {
  try {

    const { title, destination, days, itinerary } = req.body;

    const trip = await Trip.create({
      userId: req.user._id,
      title,
      destination,
      days,
      itinerary
    });

    res.status(201).json(trip);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while saving trip" });
  }
});

/* GET USER TRIPS */
router.get("/", protect, async (req, res) => {
  try {

    const trips = await Trip.find({ userId: req.user._id });

    res.json(trips);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;