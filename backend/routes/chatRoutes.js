const express = require("express");
const router  = express.Router();
const Groq    = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const generatePlan = require("../logic/planner");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {

  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.json({ type: "chat", reply: "Please type a message." });
  }

  try {
    const msg = message.toLowerCase();

    let days      = null;
    let budget    = "low";
    let interests = [];
    let aiWorked  = false;

    /* ── AI PARSING (Gemini First) ── */
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Extract travel details from the user message.
Return ONLY valid JSON — no markdown, no backticks, no explanation.

Format:
{
  "days": number,
  "budget": "low" | "medium" | "high",
  "interests": ["Nature","Food","Culture","Spiritual","Adventure"]
}

Rules:
- "cheap"/"budget" → "low", "comfort"/"moderate" → "medium", "luxury" → "high"
- "weekend" → days: 2, UNLESS a number is mentioned
- days must be 1–30
- User Message: "${message}"`;

      const result = await model.generateContent(prompt);
      let raw = result.response.text().trim();
      
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) raw = jsonMatch[0];

      const parsed = JSON.parse(raw);
      if (parsed.days)              days      = Math.min(Math.max(parseInt(parsed.days), 1), 30);
      if (parsed.budget)            budget    = parsed.budget;
      if (parsed.interests?.length) interests = parsed.interests;
      aiWorked = true;
      console.log("✅ Gemini Parsed:", parsed);

    } catch (err) {
      console.log("⚠️ Gemini parsing failed, trying Groq:", err.message);
      /* ── Groq Fallback for Parsing ── */
      try {
        const aiParse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `Extract travel details... { "days": number, "budget": "low"|"medium"|"high", "interests": [] }`
            },
            { role: "user", content: message }
          ]
        });
        let raw = aiParse.choices[0].message.content.trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) raw = jsonMatch[0];
        const parsed = JSON.parse(raw);
        if (parsed.days) days = parsed.days;
        if (parsed.budget) budget = parsed.budget;
        if (parsed.interests) interests = parsed.interests;
        aiWorked = true;
      } catch (e2) {
        console.log("⚠️ Groq fallback parsing failed:", e2.message);
      }
    }

    /* ── RULE-BASED FALLBACK ── */
    if (!aiWorked) {
      const dayMatch = msg.match(/(\d+)\s*day[s]?/);
      if (dayMatch)                    days = Math.min(parseInt(dayMatch[1]), 30);
      else if (msg.includes("weekend")) days = 2;

      if (msg.includes("cheap"))  budget = "low";
      if (msg.includes("luxury")) budget = "high";

      if (msg.includes("nature")) interests.push("Nature");
      if (msg.includes("food"))   interests.push("Food");
    }

    if (!days || days < 1) days = 2;
    if (interests.length === 0) interests = ["Nature", "Food"];

    /* ── TRAVEL INTENT CHECK ── */
    const travelIntent =
      msg.includes("trip")      || msg.includes("plan")      || msg.includes("itinerary") ||
      msg.includes("places")    || msg.includes("visit")     || msg.includes("tour")       ||
      msg.includes("bangalore") || msg.includes("bengaluru") || msg.includes("near");

    if (travelIntent) {
      const plan = await generatePlan({ days, budget, interests });
      if (plan && plan.itinerary && Object.keys(plan.itinerary).length > 0) {
        return res.json({
          type: "trip",
          message: `Here's your ${plan.days}-day ${plan.budget} trip plan for Bengaluru! 🗺️`,
          plan
        });
      }
    }

    /* ── GEMINI CHAT ── */
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        { text: "You are BharatTrip AI, a friendly travel assistant for India. Keep replies concise, helpful, and personable. You can talk about anything but try to relate it back to travel or Bangalore if possible." },
        { text: message }
      ]);
      return res.json({ type: "chat", reply: result.response.text() });
    } catch (err) {
      console.log("⚠️ Gemini Chat failed, trying Groq:", err.message);
      /* ── Groq Fallback for Chat ── */
      const chat = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are BharatTrip AI, a friendly travel assistant for India." },
          { role: "user",   content: message }
        ]
      });
      res.json({ type: "chat", reply: chat.choices[0].message.content });
    }

  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ type: "chat", reply: "Server error. Please try again." });
  }
});

module.exports = router;

module.exports = router;