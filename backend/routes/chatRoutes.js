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

    let days      = null;   // null until set — prevents fallback overwriting AI result
    let budget    = "low";
    let interests = [];
    let aiWorked  = false;

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
- "weekend" → days: 2, UNLESS a number is mentioned (e.g. "9 days" → 9)
- Default interests if none mentioned: ["Nature","Food"]
- days must be 1–10
- ALWAYS read the number from the message (e.g. "9 days cheap weekend" → days: 9)`
          },
          { role: "user", content: message }
        ]
      });

      // Strip markdown fences Groq sometimes wraps JSON in
      let raw = aiParse.choices[0].message.content.trim();
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

      const parsed = JSON.parse(raw);
      console.log("✅ AI Parsed:", parsed);

      if (parsed.days)              days      = Math.min(Math.max(parseInt(parsed.days), 1), 10);
      if (parsed.budget)            budget    = parsed.budget;
      if (parsed.interests?.length) interests = parsed.interests;
      aiWorked = true;

    } catch (err) {
      console.log("⚠️  AI parsing failed:", err.message);
    }

    /* ── RULE-BASED FALLBACK — only runs when AI failed ── */
    if (!aiWorked) {
      const dayMatch = msg.match(/(\d+)\s*day[s]?/);
      if (dayMatch)                    days = Math.min(parseInt(dayMatch[1]), 10);
      else if (msg.includes("weekend")) days = 2;
      else if (msg.includes("tomorrow")) days = 1;

      if (msg.includes("cheap")  || msg.includes("budget"))  budget = "low";
      if (msg.includes("medium") || msg.includes("comfort")) budget = "medium";
      if (msg.includes("luxury") || msg.includes("high"))    budget = "high";

      if (msg.includes("nature")   || msg.includes("park")   || msg.includes("hill"))     interests.push("Nature");
      if (msg.includes("food")     || msg.includes("eat")    || msg.includes("cafe"))      interests.push("Food");
      if (msg.includes("culture")  || msg.includes("museum") || msg.includes("heritage"))  interests.push("Culture");
      if (msg.includes("temple")   || msg.includes("spiritual"))                            interests.push("Spiritual");
      if (msg.includes("adventure")|| msg.includes("trek"))                                 interests.push("Adventure");
    }

    /* ── FINAL DEFAULTS ── */
    if (!days || days < 1) days = 2;
    if (!["low","medium","high"].includes(budget)) budget = "low";
    if (interests.length === 0) interests = ["Nature", "Food"];

    console.log("🎯 Final params:", { days, budget, interests });

    /* ── TRAVEL INTENT CHECK ── */
    const travelIntent =
      msg.includes("trip")      || msg.includes("plan")      || msg.includes("itinerary") ||
      msg.includes("places")    || msg.includes("visit")     || msg.includes("tour")       ||
      msg.includes("bangalore") || msg.includes("bengaluru") || msg.includes("nature")     ||
      msg.includes("temple")    || msg.includes("culture")   || msg.includes("adventure")  ||
      msg.includes("food")      || msg.includes("weekend")   || msg.includes("cheap")      ||
      msg.includes("budget")    || msg.includes("luxury")    || msg.includes("near");

    if (travelIntent) {
      let plan = null;

      try {
        plan = await generatePlan({ days, budget, interests });
      } catch (e) {
        console.log("⚠️  Primary planner failed:", e.message);
      }

      // Fallback if plan is empty
      if (!plan || !plan.itinerary || Object.keys(plan.itinerary).length === 0) {
        try {
          plan = await generatePlan({ days: 2, budget: "medium", interests: ["Nature", "Food"] });
        } catch (e) {
          console.log("⚠️  Fallback planner failed:", e.message);
        }
      }

      if (!plan || !plan.itinerary || Object.keys(plan.itinerary).length === 0) {
        return res.json({
          type: "chat",
          reply: "I couldn't generate a plan right now. Please try the Trip Planner page instead!"
        });
      }

      console.log("✅ Plan generated:", plan.days, "days,", plan.budget, "budget");

      return res.json({
        type: "trip",
        message: `Here's your ${plan.days}-day ${plan.budget} trip plan for Bengaluru! 🗺️`,
        plan
      });
    }

    /* ── NORMAL AI CHAT ── */
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are BharatTrip AI, a friendly travel assistant for India. Keep replies concise and helpful." },
        { role: "user",   content: message }
      ]
    });

    res.json({ type: "chat", reply: chat.choices[0].message.content });

  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ type: "chat", reply: "Server error. Please try again." });
  }
});

module.exports = router;