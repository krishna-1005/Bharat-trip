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
    const systemInstruction = `You are the BharatTrip AI Travel Agent, a proactive and charismatic concierge for India.

CORE PROTOCOL:
1. **Interactive Proactivity**: You MUST ALWAYS end your response with a "Reverse Question" to the user to learn more about their travel desires.
2. **Concierge Persona**: Be charming, sophisticated, and extremely helpful.
3. **Information Gathering**: Subtly ask for: City, Duration, Budget, and Interests.
4. **Knowledgeable**: Mention specific landmarks or hidden gems based on the city mentioned.

JSON TRIGGER:
When (and ONLY when) you have the City, Days, and Budget, and the user is ready, output exactly one JSON block at the end:
\`\`\`json
{
  "generatePlan": true,
  "city": "City Name",
  "days": 2,
  "budget": "low" | "medium" | "high",
  "interests": ["Interest1", "Interest2"]
}
\`\`\``;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const chat = model.startChat({
      history: (history || []).map(m => ({
        role: m.sender === "bot" ? "model" : "user",
        parts: [{ text: m.text }]
      })),
    });

    const result = await chat.sendMessage(message);
    let replyText = result.response.text();

    // Check for JSON block
    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const planData = JSON.parse(jsonMatch[1]);
        const plan = await generatePlan(planData);
        // Clean the text
        replyText = replyText.replace(/```json[\s\S]*?```/, "").trim();
        return res.json({ 
          type: "trip", 
          reply: replyText || `Wonderful! I've crafted your custom ${planData.city} adventure.`, 
          plan 
        });
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    }

    return res.json({ type: "chat", reply: replyText });

  } catch (error) {
    console.error("Gemini Agent Error:", error.message);
    
    // Proactive Fallback (No API)
    const msg = message.toLowerCase();
    if (msg.includes("hi") || msg.includes("hello")) {
      return res.json({ type: "chat", reply: "Hello! I'm your BharatTrip concierge. 🇮🇳 Which beautiful city in India are we planning to explore today?" });
    }
    return res.json({ 
      type: "chat", 
      reply: "I'm here and ready to help! To get started, could you tell me which city you'd like to visit, or are you looking for a recommendation? 🧭" 
    });
  }
});

module.exports = router;
