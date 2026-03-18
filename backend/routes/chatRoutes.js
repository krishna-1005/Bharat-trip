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
    const formattedHistory = (history || [])
      .filter(msg => msg.text && msg.sender)
      .map(msg => ({
        role: msg.sender === "bot" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));

    const systemInstruction = `You are BharatTrip AI, a world-class travel expert for India (including Bengaluru, Mumbai, Delhi, Jaipur, Goa, and more).

FORMATTING RULES:
1. Use **bold** for emphasis on place names.
2. Use bullet points (•) for readability.
3. Keep responses concise and friendly.
4. Use emojis.

CONVERSATION LOGIC:
1. If planning a trip, you need: **City**, **Days**, **Budget**, and **Interests**.
2. If info is missing, ask for it clearly.
3. Once you have all info, provide a summary and the JSON block below.

JSON FORMATS:
1. For full plans:
\`\`\`json
{
  "generatePlan": true,
  "city": "City Name",
  "days": number,
  "budget": "low" | "medium" | "high",
  "interests": ["Interest1", "Interest2"]
}
\`\`\`

2. For locating a specific place:
\`\`\`json
{
  "locatePlace": true,
  "placeName": "Name of the place",
  "lat": latitude,
  "lng": longitude
}
\`\`\``;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    // We use a simplified chat approach to avoid history formatting issues
    const chat = model.startChat({
      history: formattedHistory.length > 0 ? formattedHistory : [],
      generationConfig: {
        maxOutputTokens: 800,
      },
    });

    const result = await chat.sendMessage(message);
    let replyText = result.response.text();

    // Check for JSON block
    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    let planData = null;

    if (jsonMatch) {
      try {
        planData = JSON.parse(jsonMatch[1]);
        replyText = replyText.replace(/```json\s*[\s\S]*?\s*```/, "").trim();
      } catch (e) {
        console.error("Failed to parse AI JSON:", e);
      }
    }

    if (planData && planData.generatePlan) {
      const { city, days, budget, interests } = planData;
      const plan = await generatePlan({ 
        city: city || "Bengaluru",
        days: days || 2, 
        budget: budget || "medium", 
        interests: interests || ["Culture", "Food"] 
      });

      return res.json({
        type: "trip",
        reply: replyText || `I've crafted a ${days}-day plan for ${city}!`,
        plan
      });
    }

    if (planData && planData.locatePlace) {
      return res.json({
        type: "location",
        reply: replyText,
        location: {
          name: planData.placeName,
          lat: planData.lat,
          lng: planData.lng
        }
      });
    }

    return res.json({ type: "chat", reply: replyText });

  } catch (error) {
    console.error("Gemini Error:", error.message);
    
    // Fallback to basic Groq
    try {
        const groqChat = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: "You are BharatTrip AI, an Indian travel assistant. Be helpful and concise." },
                ...(history || []).slice(-5).map(m => ({ 
                  role: m.sender === "bot" ? "assistant" : "user", 
                  content: m.text 
                })),
                { role: "user", content: message }
            ]
        });
        return res.json({ type: "chat", reply: groqChat.choices[0].message.content });
    } catch (e2) {
        console.error("Groq Fallback Error:", e2.message);
        res.status(200).json({ 
          type: "chat", 
          reply: "I'm having a bit of trouble connecting to my AI brain right now. 🤖\n\nYou can still use the **Planner** tab to build your trip manually!" 
        });
    }
  }
});

module.exports = router;
