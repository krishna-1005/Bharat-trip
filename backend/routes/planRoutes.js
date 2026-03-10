const express = require("express");
const generatePlan = require("../logic/planner");

const protect = require("../middleware/protect");
const Trip = require("../models/Trip");

const router = express.Router();

/* Generate Trip Plan */
router.post("/generate", (req, res) => {

  if (!req.body) {
    return res.status(400).json({ error: "Request body missing" });
  }

  const { days, budget, interests } = req.body;

  if (!days || !budget) {
    return res.status(400).json({ error: "days and budget are required" });
  }

  const plan = generatePlan({
    days,
    budget,
    interests
  });

  res.json(plan);
});

/* Delete Trip */
router.delete("/:id", protect, async (req, res) => {

  try {

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await trip.deleteOne();

    res.json({ message: "Trip deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }

});

module.exports = router;