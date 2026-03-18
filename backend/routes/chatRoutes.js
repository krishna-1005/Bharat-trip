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
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
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

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    let replyText = result.response.text();

    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const planData = JSON.parse(jsonMatch[1]);
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
    const cityMatch = msg.match(/\b(delhi|mumbai|jaipur|goa|bangalore|bengaluru|agra|udaipur)\b/);
    
    if (cityMatch) {
      const city = cityMatch[0].charAt(0).toUpperCase() + cityMatch[0].slice(1);
      return res.json({ 
        type: "chat", 
        reply: `Ah, **${city}**! A fantastic choice. I know some incredible spots there. To help me plan, are you looking for a **relaxed cultural experience** or a **fast-paced adventure**? 🧭`
      });
    }

    if (/\b(hi|hello|hey)\b/.test(msg)) {
      return res.json({ 
        type: "chat", 
        reply: "Hello! I'm your BharatTrip AI concierge. 🇮🇳 Which beautiful city in India are we planning to explore today?" 
      });
    }

    return res.json({ 
      type: "chat", 
      reply: "I'm here and ready to help! Could you tell me a bit more about your travel style—do you prefer **luxury and comfort** or **budget-friendly hidden gems**? 💎" 
    });
  }
});

module.exports = router;
