const Trip = require("../models/Trip");

/**
 * AI Planner Service (Refined via Groq Llama 3.3)
 * Provides high-precision itinerary optimization.
 */
async function analyzeAndRefinePlan({
  city,
  days,
  budget,
  interests,
  travelerType,
  pace,
  candidates,
  userPreferences = {},
  language = "English"
}) {
  try {
    const Groq = require("groq-sdk");
    if (!process.env.GROQ_API_KEY) {
      console.warn("⚠️ GROQ_API_KEY missing. Falling back to local logic.");
      return null;
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log(`🧠 AI Planner starting using Groq (Llama 3.3) for: ${city}`);

    const prompt = `
You are an elite Indian travel architect. Optimize this ${days}-day trip to ${city} for a ${travelerType} traveler with a ${pace} pace.
Total Budget: ${budget} INR.
Interests: ${interests.join(", ")}.

### INPUT DATA:
${JSON.stringify(candidates)}

### INSTRUCTIONS:
1. Select the best 3-4 spots per day from the input data.
2. STRICTLY PRIORITIZE the user's selected interests (${interests.join(", ")}). 
3. Only include other categories (like Nature or Culture) if there are not enough spots matching the interests or if they are essential for a logical flow (e.g., Food for lunch/dinner).
4. Group spots by proximity to minimize travel time.
5. Assign a logical "bestTime" (Morning, Afternoon, Evening) for each.
6. Provide a 2-sentence "summary" of the overall vibe.
7. Return ONLY valid JSON in this structure:
{
  "summary": "...",
  "itinerary": {
    "1": [ { "name": "...", "bestTime": "...", "reason": "Why this spot fits the traveler", "category": "...", "avgCost": 0, "timeHours": 2, "lat": 0, "lng": 0 } ]
  }
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(chatCompletion.choices[0].message.content);
    console.log("✅ Main Plan optimized successfully by Groq.");

    // Transform to standard array structure
    const finalizedItinerary = [];
    Object.entries(data.itinerary).forEach(([dayNum, places]) => {
      finalizedItinerary.push({
        day: dayNum.includes("Day") ? dayNum : `Day ${dayNum}`,
        places: places.map(p => ({
          ...p,
          estimatedCost: p.avgCost || 0,
          estimatedHours: p.timeHours || 2
        }))
      });
    });

    return {
      summary: data.summary,
      itinerary: finalizedItinerary
    };

  } catch (err) {
    console.error("Groq Planning Error:", err.message);
    return null;
  }
}

module.exports = analyzeAndRefinePlan;
