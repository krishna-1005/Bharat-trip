const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const generatePlan = require("../logic/planner");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/", async (req, res) => {

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.json({
      type: "chat",
      reply: "Please type a message."
    });
  }

  try {

    const msg = message.toLowerCase();

    let days = 1;
    let budget = "low";
    let interests = [];

    /* -------- Detect days -------- */

    const dayMatch = msg.match(/(\d+)\s*day/);

    if (dayMatch) {
      days = parseInt(dayMatch[1]);
    }

    if (msg.includes("weekend")) days = 2;

    if (msg.includes("tomorrow")) days = 1;

    if (days > 5) days = 5;

    /* -------- Budget detection -------- */

    if (msg.includes("cheap") || msg.includes("budget") || msg.includes("low"))
      budget = "low";

    if (msg.includes("medium") || msg.includes("comfort"))
      budget = "medium";

    if (msg.includes("luxury") || msg.includes("high"))
      budget = "high";

    /* -------- Interest detection -------- */

    if (msg.includes("nature") || msg.includes("park") || msg.includes("lake"))
      interests.push("Nature");

    if (msg.includes("food") || msg.includes("restaurant") || msg.includes("cafe"))
      interests.push("Food");

    if (msg.includes("culture") || msg.includes("museum") || msg.includes("heritage"))
      interests.push("Culture");

    if (msg.includes("temple") || msg.includes("spiritual"))
      interests.push("Spiritual");

    if (msg.includes("adventure") || msg.includes("trek"))
      interests.push("Adventure");

    if (interests.length === 0) {
      interests = ["Nature", "Food"];
    }

    /* -------- Trip planner trigger -------- */

    const travelIntent =
      msg.includes("trip") ||
      msg.includes("plan") ||
      msg.includes("itinerary") ||
      msg.includes("places") ||
      msg.includes("visit") ||
      msg.includes("tour") ||
      msg.includes("bangalore") ||
      msg.includes("bengaluru");

    if (travelIntent) {

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

      if (!plan || !plan.itinerary || Object.keys(plan.itinerary).length === 0) {
        return res.json({
          type: "chat",
          reply: "I couldn't generate a plan. Try adding interests like nature or food."
        });
      }

      console.log("Generated plan:", plan);

      return res.json({
        type: "trip",
        message: `Here's a ${days}-day ${budget} trip plan for Bengaluru.`,
        plan
      });

    }

    /* -------- Normal AI chat -------- */

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
      type: "chat",
      reply: chat.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      type: "chat",
      reply: "Server error"
    });

  }

});

module.exports = router;