const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const generatePlan = require("../logic/planner");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/", async (req, res) => {

  const { message } = req.body;

  try {

    const msg = message.toLowerCase();

    let days = 1;
    let budget = "low";
    let interests = [];

    /* ───── Detect number of days ───── */

    const dayMatch = msg.match(/(\d+)\s*day/);

    if (dayMatch) {
      days = parseInt(dayMatch[1]);
    }

    /* limit days to avoid crazy numbers */
    if (days > 7) days = 7;

    /* ───── Budget detection ───── */

    if (msg.includes("low") || msg.includes("cheap") || msg.includes("budget")) {
      budget = "low";
    }

    if (msg.includes("medium") || msg.includes("comfort")) {
      budget = "medium";
    }

    if (msg.includes("high") || msg.includes("luxury")) {
      budget = "high";
    }

    /* ───── Interest detection ───── */

    if (msg.includes("nature")) interests.push("Nature");
    if (msg.includes("food")) interests.push("Food");
    if (msg.includes("culture")) interests.push("Culture");
    if (msg.includes("temple")) interests.push("Spiritual");
    if (msg.includes("adventure")) interests.push("Adventure");

    /* fallback interests if user gives none */
    if (interests.length === 0) {
      interests = ["Culture", "Nature"];
    }

    /* ───── If message asks for trip plan ───── */

    if (
      msg.includes("trip") ||
      msg.includes("plan") ||
      msg.includes("itinerary")
    ) {

      const plan = generatePlan({
        days,
        budget,
        interests
      });

      console.log("Generated plan:", plan);

      return res.json({ plan });

    }

    /* ───── Otherwise normal AI chat ───── */

    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are BharatTrip AI, a helpful travel assistant for India."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: chat.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "Server error"
    });

  }

});

module.exports = router;