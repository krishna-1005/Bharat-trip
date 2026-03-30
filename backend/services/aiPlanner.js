const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeAndRefinePlan({
  city,
  days,
  budget,
  interests,
  travelerType,
  pace,
  candidates
}) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn("⚠️ GEMINI_API_KEY missing or invalid");
    return null;
  }

  const prompt = `
Create a ${days}-day itinerary for ${city}.

Interests: ${interests.join(", ")}
Budget: ${budget}
Traveler: ${travelerType}
Pace: ${pace}

For each place, suggest a realistic "bestTime" to visit (Morning, Afternoon, Evening, or Night) and a brief "timeReason" (e.g., "Cool weather", "Fewer crowds", "Active nightlife", "Best lighting").

Return JSON:
{
  "1": [{ 
    "name": "", 
    "category": "", 
    "avgCost": 0, 
    "timeHours": 2, 
    "lat": 0, 
    "lng": 0,
    "bestTime": "Morning",
    "timeReason": "Cool weather and fewer crowds"
  }]
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);

  } catch (err) {
    console.error("AI Planning Error:", err.message);
    return null;
  }
}

module.exports = analyzeAndRefinePlan;