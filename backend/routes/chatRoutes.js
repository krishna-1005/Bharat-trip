const express = require("express");
const router  = express.Router();
const Groq    = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { admin } = require("../firebaseAdmin");
const Trip = require("../models/Trip");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1beta" });
const generatePlan = require("../logic/planner");

let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith("gsk_")) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

router.post("/", async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.json({ type: "chat", reply: "Please type a message." });
  }

  let loggedUserId = null;

  try {
    let replyText = "";
    let planData = null;

    // Optional Auth handling for Chatbot
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        const userObj = await User.findOne({ email: decoded.email });
        if (userObj) loggedUserId = userObj._id;
      } catch (e) {
        try {
          if (process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userObj = await User.findById(decoded.id);
            if (userObj) loggedUserId = userObj._id;
          }
        } catch (jwtErr) {}
      }
    }

    // System Instruction for the AI Agent
    const systemInstruction = `You are the GoTripo AI Agent, a world-class travel concierge for India.

CORE MISSION:
1. **Never be boring**. Use emojis and a friendly, sophisticated tone.
2. **Reverse Questions**: You MUST end EVERY response with a question to learn about the user (e.g., "Do you prefer historical sites or local food?", "Is this a solo trip or with friends?").
3. **Smart Suggestions**: Mention at least one specific landmark or hidden gem when a city is mentioned.
4. **Iterative Planning**: Don't ask for everything at once. Focus on one detail at a time.

JSON TRIGGER:
Only when you have City, Days, and Budget, and the user is ready, output exactly one JSON block at the END of your message. 
MANDATORY: If you say "I've crafted a plan" or "Check it out below", you MUST include this JSON block:
\`\`\`json
{
  "generatePlan": true,
  "city": "City Name",
  "days": 2,
  "budget": "low" | "medium" | "high",
  "interests": ["Interest1", "Interest2"],
  "travelerType": "solo",
  "pace": "relaxed" | "moderate" | "fast"
}
\`\`\``;

    // Normalize history to handle both {sender, text} and {role, content}
    const normalizedHistory = (history || []).map(m => ({
      text: m.text || m.content || "",
      sender: m.sender || (m.role === "assistant" || m.role === "bot" ? "bot" : "user")
    })).filter(m => m.text);

    // Filter and format history to ensure it's alternating and starts with USER
    let formattedHistory = normalizedHistory
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
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        throw new Error("GEMINI_API_KEY missing or invalid");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1beta" });
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: { maxOutputTokens: 1000 }
      });

      const result = await chat.sendMessage(systemInstruction + "\n\nUser: " + message);
      replyText = result.response.text();

    } catch (geminiError) {
      console.warn("Gemini Error, falling back to Groq:", geminiError.message);
      
      // 2. TRY GROQ IF GEMINI FAILS
      if (groq) {
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemInstruction },
              ...formattedHistory.map(h => ({ role: h.role === "model" ? "assistant" : "user", content: h.parts[0].text })),
              { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
          });
          replyText = chatCompletion.choices[0]?.message?.content || "";
        } catch (groqError) {
          console.error("Groq Error:", groqError.message);
          throw new Error("All AI services failed"); // Trigger rule-based fallback
        }
      } else {
        throw new Error("Gemini failed and no Groq client available");
      }
    }

    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[1]);
        const plan = await generatePlan(parsedData);
        
        // Save to DB
        const savedTrip = await Trip.create({
          userId: loggedUserId,
          isGuest: !loggedUserId,
          title: `${parsedData.city} Trip`,
          destination: parsedData.city,
          days: plan.days,
          itinerary: plan.itinerary,
          totalTripCost: plan.totalTripCost,
          totalBudget: plan.totalBudget,
          summary: plan.summary,
          travelerType: parsedData.travelerType || "solo",
          pace: parsedData.pace || "moderate",
          recommendedStay: plan.recommendedStay,
          recommendedTransport: plan.recommendedTransport,
          status: "upcoming"
        });

        replyText = replyText.replace(/```json[\s\S]*?```/, "").trim();
        return res.json({ 
          type: "plan", 
          reply: replyText, 
          planData: { id: savedTrip._id, city: parsedData.city } 
        });
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    }

    return res.json({ type: "chat", reply: replyText });

  } catch (error) {
    console.error("Gemini Agent Error:", error.message);
    
    // SMART INTERACTIVE FALLBACK (No API needed)
    const msg = message.toLowerCase();
    
    // Normalize history for fallback as well
    const safeHistory = (history || []).map(m => ({
      text: m.text || m.content || "",
      sender: m.sender || (m.role === "assistant" || m.role === "bot" ? "bot" : "user")
    })).filter(m => m.text);

    // 1. Check for City (Ignore the first intro message from history)
    let city = null;
    const cities = ["delhi", "mumbai", "jaipur", "goa", "bangalore", "bengaluru", "agra", "udaipur"];
    
    // Only check city in history IF it's not the very first intro message
    const userHistory = safeHistory.filter(h => h.sender === "user").map(h => h.text.toLowerCase()).join(" ");
    
    const cityInMsg = msg.match(new RegExp(`\\b(${cities.join("|")})\\b`));
    const cityInHistory = userHistory.match(new RegExp(`\\b(${cities.join("|")})\\b`));
    
    if (cityInMsg) city = cityInMsg[0];
    else if (cityInHistory) city = cityInHistory[0];

    // 2. Build consistent history text for subsequent checks
    const historyText = safeHistory.map(h => h.text.toLowerCase()).join(" ");

    // 3. Check for Pace
    let pace = null;
    if (msg.includes("relaxed") || historyText.includes("relaxed")) pace = "relaxed";
    else if (msg.includes("fast") || historyText.includes("fast")) pace = "fast";

    // 4. Check for Budget
    let budget = null;
    if (msg.includes("luxury") || msg.includes("comfort") || historyText.includes("luxury") || historyText.includes("comfort")) budget = "high";
    else if (msg.includes("budget") || msg.includes("hidden gem") || historyText.includes("budget") || historyText.includes("hidden gem")) budget = "low";

    // 5. Check for Duration (Days)
    let days = null;
    // Look for standalone number or "X days"
    const daysRegex = /\b(\d+)\b(?:\s*day)?/i;
    const currentDaysMatch = msg.match(daysRegex);
    
    if (currentDaysMatch) {
      days = parseInt(currentDaysMatch[1]);
    } else {
      const daysMatch = historyText.match(/(\d+)\s*day/i);
      if (daysMatch) days = parseInt(daysMatch[1]);
    }

    // 6. Check for Interests
    let interests = null;
    const interestKeywords = ["beach", "temple", "history", "nature", "nightlife", "food", "adventure", "culture", "shopping", "sightseeing"];
    const foundInterests = interestKeywords.filter(i => msg.includes(i) || historyText.includes(i));
    if (foundInterests.length > 0) interests = foundInterests;

    // 7. State-based response (Strict flow: City -> Pace -> Budget -> Days -> Interests)
    if (!city) {
      if (/\b(hi|hello|hey|greetings|namaste)\b/.test(msg)) {
        return res.json({ 
          type: "chat", 
          reply: "Hello! I'm your GoTripo AI concierge. 🇮🇳 Which beautiful city in India are we planning to explore today? (Delhi, Mumbai, Jaipur, Goa, or Bengaluru?)" 
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

    // Check if the user is currently answering the "days" question
    const lastBotMsg = safeHistory.length > 0 ? safeHistory[safeHistory.length - 1].text.toLowerCase() : "";
    const isAnsweringDays = lastBotMsg.includes("how many days");


    if (!days || (isAnsweringDays && isNaN(parseInt(msg)))) {
      return res.json({
        type: "chat",
        reply: `Perfect. And how many days will you be staying in **${cityCap}**? (e.g., '4') 📅`
      });
    }

    if (!interests) {
      return res.json({
        type: "chat",
        reply: `Almost there! What are you most interested in exploring in **${cityCap}**? (Beaches, Temples, History, Nightlife, or Nature?) 🌴`
      });
    }

    // 8. If we have everything, generate a plan!
    try {
      const finalDays = days > 10 ? 10 : days; // Safety limit
      const parsedData = {
        city: cityCap,
        days: finalDays,
        budget: budget,
        interests: interests,
        pace: pace
      };
      const plan = await generatePlan(parsedData);

      // Save to DB
      const savedTrip = await Trip.create({
        userId: loggedUserId,
        isGuest: !loggedUserId,
        title: `${cityCap} Trip`,
        destination: cityCap,
        days: plan.days,
        itinerary: plan.itinerary,
        totalTripCost: plan.totalTripCost,
        totalBudget: plan.totalBudget,
        summary: plan.summary,
        travelerType: "solo",
        pace: pace,
        recommendedStay: plan.recommendedStay,
        recommendedTransport: plan.recommendedTransport,
        status: "upcoming"
      });

      return res.json({ 
        type: "plan", 
        reply: `Excellent! [v2] I've crafted a perfect **${finalDays}-day**, **${pace}**, **${budget === "high" ? "luxury" : "budget"}** itinerary for your **${cityCap}** adventure focusing on **${interests.join(", ")}**. Check it out below! 🗺️`, 
        planData: { id: savedTrip._id, city: cityCap } 
      });
    } catch (e) {
      console.error("Fallback Error:", e);
      return res.json({ 
        type: "chat", 
        reply: `I'm having a little trouble generating the full map right now, but for **${cityCap}**, I highly recommend visiting the local landmarks! Enjoy your ${days} day stay!` 
      });
    }
  }
});

module.exports = router;