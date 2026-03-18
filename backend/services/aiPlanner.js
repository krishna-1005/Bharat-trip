const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeAndRefinePlan({ city, days, budget, interests, travelerType, pace, candidates }) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY missing, skipping AI refinement");
    return null;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `
You are a world-class ${city} travel expert. Analyze the provided candidates and design a premium itinerary.

CRITICAL INSTRUCTIONS:
1. **Prioritize Famous Landmarks**: You MUST include the most iconic, world-famous, and "must-see" tourist attractions of ${city} first.
2. **Logical Flow**: Group places that are geographically close to minimize travel time.
3. **Thematic Days**: Each day should have a clear theme (e.g., "Royal Heritage", "Modern Pulse", "Nature Escape").
4. **All Tourist Spots**: Use as many quality candidates as possible to fill the ${days} days, ensuring a full experience.

USER REQUIREMENTS:
- Duration: ${days} days
- Budget: ${budget}
- Interests: ${interests.join(", ")}
- Traveler: ${travelerType}
- Pace: ${pace}

CANDIDATE PLACES (JSON):
${JSON.stringify(candidates.map(c => ({ name: c.name, cat: c.category, tags: c.tags })))}

TASK:
Return ONLY a JSON object mapping day numbers to an array of place NAMES. Pick the most famous ones from the list.

FORMAT:
{
  "1": ["Famous Landmark A", "Famous Landmark B", "Famous Landmark C"],
  "2": ["Iconic Spot D", "Must-see E"]
}
`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("AI Planning Error:", err.message);
    return null;
  }
}

module.exports = analyzeAndRefinePlan;
