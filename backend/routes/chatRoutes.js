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

    if (days > 5) days = 5;

    /* ───── Budget detection ───── */

    if (msg.includes("low") || msg.includes("cheap") || msg.includes("budget"))
      budget = "low";

    if (msg.includes("medium") || msg.includes("comfort"))
      budget = "medium";

    if (msg.includes("high") || msg.includes("luxury"))
      budget = "high";

    /* ───── Interest detection ───── */

    if (msg.includes("nature")) interests.push("Nature");
    if (msg.includes("food")) interests.push("Food");
    if (msg.includes("culture")) interests.push("Culture");
    if (msg.includes("temple")) interests.push("Spiritual");
    if (msg.includes("adventure")) interests.push("Adventure");

    if (interests.length === 0) {
      interests = ["Nature", "Food", "Culture", "Adventure"];
    }

    /* ───── Trip planner trigger ───── */

    if (
      msg.includes("trip") ||
      msg.includes("plan") ||
      msg.includes("itinerary")
    ) {

      let plan;

      try {

        plan = generatePlan({
          days,
          budget,
          interests
        });

      } catch (e) {

        console.log("Planner fallback triggered");

        plan = generatePlan({
          days: 2,
          budget: "medium",
          interests: ["Nature", "Food"]
        });

      }

      if (!plan || !plan.itinerary) {
        return res.json({
          reply: "I couldn't generate a plan. Try adding interests like nature or food."
        });
      }

      console.log("Generated plan:", plan);

      return res.json({ plan });

    }

    /* ───── Normal AI chat ───── */

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