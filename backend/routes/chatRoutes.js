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

    // Detect trip keywords
    const msg = message.toLowerCase();

    let days = 1;
    let budget = "low";
    let interests = [];

    if (msg.includes("2 day")) days = 2;
    if (msg.includes("3 day")) days = 3;

    if (msg.includes("low")) budget = "low";
    if (msg.includes("medium")) budget = "medium";
    if (msg.includes("high")) budget = "high";

    if (msg.includes("nature")) interests.push("Nature");
    if (msg.includes("culture")) interests.push("Culture");
    if (msg.includes("temple")) interests.push("Spiritual");

    // If it looks like a trip request → generate plan
    if (msg.includes("trip") || msg.includes("plan")) {

      const plan = generatePlan({
        days,
        budget,
        interests
      });

      console.log("Generated plan:", plan);
      return res.json({ plan });

    }

    // Otherwise normal AI chat
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are BharatTrip AI, a helpful travel assistant for India."
        },
        { role: "user", content: message }
      ]
    });

    res.json({
      reply: chat.choices[0].message.content
    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "Server error"
    });

  }

});

module.exports = router;