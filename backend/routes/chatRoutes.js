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
Your goal is to help users plan their perfect trip.

CONVERSATION LOGIC:
1. If the user wants a trip plan, you NEED three pieces of information:
   - Number of days (1-30)
   - Budget (low, medium, or high)
   - Interests (e.g., Nature, Food, Culture, Spiritual, Adventure, Shopping)

2. If any of these are missing, ask for them politely and conversationally. Don't ask all at once if it feels overwhelming—be natural.
3. If you have all three pieces of information, you MUST provide a JSON block at the end of your message to trigger the plan generator.

JSON FORMAT (at the end of your response):
\`\`\`json
{
  "generatePlan": true,
  "days": number,
  "budget": "low" | "medium" | "high",
  "interests": ["Interest1", "Interest2"]
}
\`\`\`

4. Even if you trigger a plan, still give a friendly introductory sentence.
5. If the user is just chatting or asking general questions about Bengaluru, answer them expertly without the JSON block.`;

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