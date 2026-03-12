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
    const formattedHistory = (history || []).map(msg => ({
      role: msg.sender === "bot" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = `You are BharatTrip AI, a friendly and expert travel assistant for Bengaluru, India. 

FORMATTING RULES:
1. Use **bold** for emphasis on place names or important terms.
2. Use bullet points (•) or numbered lists for readability.
3. Keep paragraphs short (1-2 sentences).
4. Use emojis to make the conversation lively.

CONVERSATION LOGIC:
1. If planning a trip, you need: **Days**, **Budget**, and **Interests**.
2. If info is missing, ask for it using a clear bulleted list of what you still need.
3. Once you have all info, provide a summary and the JSON block below.

JSON FORMAT:
\`\`\`json
{
  "generatePlan": true,
  "days": number,
  "budget": "low" | "medium" | "high",
  "interests": ["Interest1", "Interest2"]
}
\`\`\`

Example Reply:
"I'd love to help! To give you the best experience, could you tell me:
• How many **days** are you staying?
• What is your **budget** (Low, Medium, or High)?
• Any specific **interests** like Food or Nature?"`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
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
        // Remove the JSON block from the reply text so the user doesn't see raw JSON
        replyText = replyText.replace(/```json\s*[\s\S]*?\s*```/, "").trim();
      } catch (e) {
        console.error("Failed to parse AI JSON:", e);
      }
    }

    if (planData && planData.generatePlan) {
      const { days, budget, interests } = planData;
      const plan = await generatePlan({ 
        days: days || 2, 
        budget: budget || "medium", 
        interests: interests || ["Culture", "Food"] 
      });

      return res.json({
        type: "trip",
        reply: replyText || `Great! I've crafted a ${days}-day plan for you.`,
        plan
      });
    }

    // Regular chat response
    return res.json({ type: "chat", reply: replyText });

  } catch (error) {
    console.error("Chat route error:", error);
    
    // Fallback to basic Groq if Gemini fails
    try {
        const groqChat = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are BharatTrip AI, a travel assistant for Bengaluru. Be helpful and ask for days, budget, and interests if the user wants a plan." },
                ...(history || []).map(m => ({ role: m.sender === "bot" ? "assistant" : "user", content: m.text })),
                { role: "user", content: message }
            ]
        });
        return res.json({ type: "chat", reply: groqChat.choices[0].message.content });
    } catch (e2) {
        res.status(500).json({ type: "chat", reply: "I'm having a bit of trouble connecting right now. Please try again in a moment!" });
    }
  }
});

module.exports = router;