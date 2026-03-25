const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use GoogleGenerativeAI with explicit v1 API version
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1" });

async function analyzeAndRefinePlan({ city, days, budget, interests, travelerType, pace, candidates }) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY missing, skipping AI refinement");
    return null;
  }

  // Use gemini-1.5-flash which is the recommended stable model
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  }, { apiVersion: "v1" });

  const systemPrompt = `
You are a world-class ${city} travel expert. Design a premium, realistic itinerary based on the user's needs.

CRITICAL INSTRUCTIONS:
1. **Real Data**: Use your internal knowledge to provide REAL, well-known tourist attractions in ${city}. 
2. **Realistic Pricing**: Provide actual average costs (in INR) for entrance fees, activities, or average meals at the suggested places. DO NOT use random numbers.
3. **Prioritize Landmarks**: Include the most iconic, "must-see" landmarks for a first-time visitor.
4. **Logical Flow**: Group places geographically to minimize travel time.
5. **Thematic Days**: Give each day a clear theme.

USER REQUIREMENTS:
- Duration: ${days} days
- Budget Level: ${budget} (low: budget-friendly, medium: mid-range, high: luxury)
- Interests: ${interests.join(", ")}
- Traveler: ${travelerType}
- Pace: ${pace}

CANDIDATE PLACES FOR REFERENCE (JSON):
${JSON.stringify(candidates.map(c => ({ name: c.name, cat: c.category })))}

TASK:
Fill all ${days} days with at least 3-4 high-quality places per day. Return a JSON object mapping day numbers (as strings) to an array of place objects.

FORMAT:
{
  "1": [
    {
      "name": "Exact Name of Place",
      "category": "Culture/Nature/Food/Shopping/etc",
      "avgCost": 500,
      "description": "Short 1-sentence description.",
      "timeHours": 2,
      "lat": 12.9716,
      "lng": 77.5946
    }
  ],
  "2": [...]
}

NOTE: lat and lng MUST be numbers. Use your own knowledge for lat/lng if the place is not in the candidate list. Return ONLY the JSON object.
`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    
    // Safety: ensure lat/lng are numbers
    Object.keys(parsed).forEach(day => {
      parsed[day] = parsed[day].map(p => ({
        ...p,
        lat: Number(p.lat),
        lng: Number(p.lng)
      }));
    });
    
    return parsed;
  } catch (err) {
    console.error("AI Planning Error:", err.message);
    return null;
  }
}

module.exports = analyzeAndRefinePlan;
