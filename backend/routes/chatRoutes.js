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

  console.log(`💬 Chat request: "${message}"`);

  try {
    // 1. Prepare a single robust prompt for Gemini instead of startChat history
    // This avoids "alternating role" errors which often break Gemini chats
    const chatContext = (history || [])
      .slice(-6) // last 6 messages
      .map(m => `${m.sender === "bot" ? "Assistant" : "User"}: ${m.text}`)
      .join("\n");

    const fullPrompt = `You are BharatTrip AI, an expert travel guide for India.
Current Context:
${chatContext}

User Message: ${message}

RULES:
- If the user wants a trip plan, you need: City, Days, Budget (low/medium/high), and Interests.
- Ask for missing info nicely.
- Once you have all info, provide a short summary and EXACTLY one JSON block at the end.

JSON FORMAT:
\`\`\`json
{
  "generatePlan": true,
  "city": "City Name",
  "days": number,
  "budget": "low" | "medium" | "high",
  "interests": ["Interest1", "Interest2"]
}
\`\`\`

Assistant Response:`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(fullPrompt);
    let replyText = result.response.text();

    console.log("✅ Gemini response received");

    // Check for JSON block
    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    let planData = null;

    if (jsonMatch) {
      try {
        planData = JSON.parse(jsonMatch[1]);
        replyText = replyText.replace(/```json\s*[\s\S]*?\s*```/, "").trim();
      } catch (e) {
        console.error("❌ Failed to parse AI JSON:", e.message);
      }
    }

    if (planData && planData.generatePlan) {
      const city = planData.city || "Delhi";
      const plan = await generatePlan({ 
        city: city,
        days: planData.days || 2, 
        budget: planData.budget || "medium", 
        interests: planData.interests || ["Sightseeing"] 
      });

      return res.json({
        type: "trip",
        reply: replyText || `Perfect! I've crafted your ${city} itinerary.`,
        plan
      });
    }

    return res.json({ type: "chat", reply: replyText });

  } catch (error) {
    console.error("⚠️ Gemini primary failed:", error.message);
    
    // 2. Fallback to Groq with a robust model ID
    try {
        const groqChat = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are BharatTrip AI, an expert Indian travel guide. Be helpful and concise." },
                ...(history || []).slice(-4).map(m => ({ 
                  role: m.sender === "bot" ? "assistant" : "user", 
                  content: m.text 
                })),
                { role: "user", content: message }
            ]
        });
        console.log("✅ Groq fallback succeeded");
        return res.json({ type: "chat", reply: groqChat.choices[0].message.content });
    } catch (e2) {
        console.error("❌ All AI models failed:", e2.message);
        res.status(200).json({ 
          type: "chat", 
          reply: "I'm having a bit of trouble connecting to my AI brain right now. 🤖\n\nIt might be because my API keys have reached their limit. You can still use the **Planner** tab to build your trip manually!" 
        });
    }
  }
});

module.exports = router;
