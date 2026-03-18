const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeAndRefinePlan({ city, days, budget, interests, travelerType, pace, candidates }) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY missing, skipping AI refinement");
    return null;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `
You are an expert ${city} travel guide. Analyze the provided list of potential places and create a logical, high-quality itinerary for ${city}.

USER REQUIREMENTS:
- Duration: ${days} days
- Budget: ${budget}
- Interests: ${interests.join(", ")}
- Traveler: ${travelerType}
- Pace: ${pace}

CANDIDATE PLACES (JSON):
${JSON.stringify(candidates.map(c => ({ name: c.name, cat: c.category, tags: c.tags })))}

TASK:
1. Pick the absolute best places from candidates that match the user's interests and budget.
2. Group them into ${days} logical days.
3. Ensure days are balanced and themed (e.g., "Culture Day", "Nature & Relaxation").
4. Return ONLY a JSON object mapping day numbers to an array of place NAMES.

FORMAT:
{
  "1": ["Place A", "Place B", "Place C"],
  "2": ["Place D", "Place E"]
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
