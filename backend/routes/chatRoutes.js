const express = require("express");
const router  = express.Router();
const Groq    = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const generatePlan = require("../logic/planner");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
router.post("/", async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.json({ type: "chat", reply: "Please type a message." });
  }

  try {
    let replyText = "";
    let planData = null;

    // System Instruction for the AI Agent
    const systemInstruction = `You are the BharatTrip AI Agent, a world-class travel concierge for India.

CORE MISSION:
1. **Never be boring**. Use emojis and a friendly, sophisticated tone.
2. **Reverse Questions**: You MUST end EVERY response with a question to learn about the user (e.g., "Do you prefer historical sites or local food?", "Is this a solo trip or with friends?").
3. **Smart Suggestions**: Mention at least one specific landmark or hidden gem when a city is mentioned.
4. **Iterative Planning**: Don't ask for everything at once. Focus on one detail at a time.

JSON TRIGGER:
Only when you have City, Days, and Budget, and the user is ready, output exactly one JSON block:
\`\`\`json
{
  "generatePlan": true,
  "city": "City Name",
  "days": 2,
  "budget": "low" | "medium" | "high",
  "interests": ["Interest1", "Interest2"]
}
\`\`\``;

    // Filter and format history to ensure it's alternating and starts with USER
    let formattedHistory = (history || [])
      .filter(m => m.text && m.sender)
      .map(m => ({
        role: m.sender === "bot" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

    // Gemini requires history to start with 'user'
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    // 1. TRY GEMINI FIRST
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
      });

      const chat = model.startChat({ history: formattedHistory });
      const result = await chat.sendMessage(message);
      replyText = result.response.text();
    } catch (geminiError) {
      console.warn("Gemini Error, falling back to Groq/Rule-based:", geminiError.message);
      
      // 2. TRY GROQ IF GEMINI FAILS
      if (process.env.GROQ_API_KEY) {
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemInstruction },
              ...formattedHistory.map(h => ({ role: h.role === "model" ? "assistant" : "user", content: h.parts[0].text })),
              { role: "user", content: message }
            ],
            model: "llama3-70b-8192",
            temperature: 0.7,
          });
          replyText = chatCompletion.choices[0]?.message?.content || "";
        } catch (groqError) {
          console.error("Groq Error:", groqError.message);
          throw new Error("All AI services failed"); // Trigger rule-based fallback
        }
      } else {
        throw new Error("Gemini failed and no Groq key");
      }
    }

    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        planData = JSON.parse(jsonMatch[1]);
        const plan = await generatePlan(planData);
        replyText = replyText.replace(/```json[\s\S]*?```/, "").trim();
        return res.json({ type: "trip", reply: replyText, plan });
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    }

    return res.json({ type: "chat", reply: replyText });

  } catch (error) {
    console.error("Gemini Agent Error:", error.message);
    
    // SMART INTERACTIVE FALLBACK (No API needed)
    const msg = message.toLowerCase();
    const historyText = (history || []).map(h => h.text.toLowerCase()).join(" ");
    
    // 1. Check for City
    let city = null;
    const cities = ["delhi", "mumbai", "jaipur", "goa", "bangalore", "bengaluru", "agra", "udaipur"];
    const cityInMsg = msg.match(new RegExp(`\\b(${cities.join("|")})\\b`));
    const cityInHistory = historyText.match(new RegExp(`\\b(${cities.join("|")})\\b`));
    
    if (cityInMsg) city = cityInMsg[0];
    else if (cityInHistory) city = cityInHistory[0];

    // 2. Check for Pace
    let pace = null;
    if (msg.includes("relaxed") || historyText.includes("relaxed")) pace = "relaxed";
    else if (msg.includes("fast") || historyText.includes("fast")) pace = "fast";

    // 3. Check for Budget
    let budget = null;
    if (msg.includes("luxury") || msg.includes("comfort") || historyText.includes("luxury") || historyText.includes("comfort")) budget = "high";
    else if (msg.includes("budget") || msg.includes("hidden gem") || historyText.includes("budget") || historyText.includes("hidden gem")) budget = "low";

    // 4. State-based response
    if (!city) {
      if (/\b(hi|hello|hey)\b/.test(msg)) {
        return res.json({ 
          type: "chat", 
          reply: "Hello! I'm your BharatTrip AI concierge. 🇮🇳 Which beautiful city in India are we planning to explore today?" 
        });
      }
      return res.json({ 
        type: "chat", 
        reply: "I'm excited to help you plan! Which city are we exploring? (Delhi, Mumbai, Jaipur, Goa, or Bengaluru?)" 
      });
    }

    const cityCap = city.charAt(0).toUpperCase() + city.slice(1);

    if (!pace) {
      return res.json({ 
        type: "chat", 
        reply: `Ah, **${cityCap}**! A fantastic choice. To help me plan, are you looking for a **relaxed cultural experience** or a **fast-paced adventure**? 🧭`
      });
    }

    if (!budget) {
      return res.json({ 
        type: "chat", 
        reply: `Got it, a **${pace}** trip to **${cityCap}**. Do you prefer **luxury and comfort** or **budget-friendly hidden gems**? 💎`
      });
    }

    // 5. If we have everything, generate a plan!
    try {
      const planData = {
        city: cityCap,
        days: 3,
        budget: budget,
        interests: ["culture", "food", "sightseeing"],
        pace: pace
      };
      const plan = await generatePlan(planData);
      return res.json({ 
        type: "trip", 
        reply: `Excellent! I've crafted a perfect **${pace}**, **${budget === "high" ? "luxury" : "budget"}** itinerary for your **${cityCap}** adventure. Check it out below! 🗺️`, 
        plan 
      });
    } catch (e) {
      return res.json({ 
        type: "chat", 
        reply: `I'm having a little trouble generating the full map right now, but for **${cityCap}**, I highly recommend visiting the local landmarks! How many days are you staying?` 
      });
    }
  }
});

module.exports = router;
