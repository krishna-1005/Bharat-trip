const express = require("express");
const router  = express.Router();
const Groq    = require("groq-sdk");
const generatePlan = require("../logic/planner");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.json({ type: "chat", reply: "Please type a message." });
  }

  try {
    const msg = message.toLowerCase();

    let days      = 2;
    let budget    = "low";
    let interests = [];

    /* ── AI PARSING ── */
    try {
      const aiParse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Extract travel details from the user message.
Return ONLY valid JSON — no markdown, no backticks, no explanation.

Format:
{
  "days": number,
  "budget": "low" | "medium" | "high",
  "interests": ["Nature","Food","Culture","Spiritual","Adventure"]
}

Rules:
- "cheap"/"budget" → "low", "comfort"/"moderate" → "medium", "luxury" → "high"
- "weekend" → days: 2
- If no interests mentioned, use ["Nature","Food"]
- days must be between 1 and 10`
          },
          { role: "user", content: message }
        ]
      });

      // ✅ Strip markdown fences Groq sometimes wraps JSON in
      let raw = aiParse.choices[0].message.content.trim();
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

      const parsed = JSON.parse(raw);

      if (parsed.days)      days      = Math.min(Math.max(parseInt(parsed.days) || 2, 1), 10);
      if (parsed.budget)    budget    = parsed.budget;
      if (parsed.interests?.length) interests = parsed.interests;

      console.log("✅ AI Parsed:", { days, budget, interests });

    } catch (err) {
      console.log("⚠️  AI parsing failed, using rule-based fallback:", err.message);
    }

    /* ── RULE-BASED FALLBACK ── */
    if (days === 2) {
      const dayMatch = msg.match(/(\d+)\s*day[s]?/);
      if (dayMatch) days = Math.min(parseInt(dayMatch[1]), 10);
      if (msg.includes("weekend")) days = 2;
      if (msg.includes("tomorrow")) days = 1;
    }

    if (!["low","medium","high"].includes(budget)) budget = "low";

    if (interests.length === 0) {
      if (msg.includes("nature") || msg.includes("park") || msg.includes("lake") || msg.includes("hill"))  interests.push("Nature");
      if (msg.includes("food")   || msg.includes("restaurant") || msg.includes("cafe") || msg.includes("eat")) interests.push("Food");
      if (msg.includes("culture")|| msg.includes("museum")     || msg.includes("heritage")) interests.push("Culture");
      if (msg.includes("temple") || msg.includes("spiritual"))  interests.push("Spiritual");
      if (msg.includes("adventure")||msg.includes("trek")||msg.includes("climb")) interests.push("Adventure");
      if (interests.length === 0) interests = ["Nature", "Food"];
    }

    /* ── TRAVEL INTENT CHECK ── */
    const travelIntent =
      msg.includes("trip")      || msg.includes("plan")      || msg.includes("itinerary") ||
      msg.includes("places")    || msg.includes("visit")     || msg.includes("tour")       ||
      msg.includes("bangalore") || msg.includes("bengaluru") || msg.includes("nature")     ||
      msg.includes("temple")    || msg.includes("culture")   || msg.includes("adventure")  ||
      msg.includes("food")      || msg.includes("weekend")   || msg.includes("day trip")   ||
      msg.includes("cheap")     || msg.includes("budget")    || msg.includes("luxury");

    if (travelIntent) {

      let plan = null;

      try {
        // ✅ generatePlan is async — always await it
        plan = await generatePlan({ days, budget, interests });
      } catch (e) {
        console.log("⚠️  Primary planner failed:", e.message);
      }

      // ✅ Fallback also awaited
      if (!plan || !plan.itinerary || Object.keys(plan.itinerary).length === 0) {
        console.log("⚠️  Plan empty, trying fallback...");
        try {
          plan = await generatePlan({ days: 2, budget: "medium", interests: ["Nature", "Food"] });
        } catch (e) {
          console.log("⚠️  Fallback planner also failed:", e.message);
        }
      }

      if (!plan || !plan.itinerary || Object.keys(plan.itinerary).length === 0) {
        return res.json({
          type: "chat",
          reply: "I couldn't generate a plan right now. Please try the Trip Planner page instead!"
        });
      }

      console.log("✅ Plan generated:", days, "days,", budget, "budget");

      return res.json({
        type: "trip",
        message: `Here's your ${days}-day ${budget} trip plan for Bengaluru! 🗺️`,
        plan
      });
    }

    /* ── NORMAL AI CHAT ── */
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are BharatTrip AI, a friendly travel assistant specializing in India travel. Keep replies concise and helpful."
        },
        { role: "user", content: message }
      ]
    });

    res.json({
      type: "chat",
      reply: chat.choices[0].message.content
    });

  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ type: "chat", reply: "Server error. Please try again." });
  }
});

module.exports = router;