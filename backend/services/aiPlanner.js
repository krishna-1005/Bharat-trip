const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeAndRefinePlan({
  city,
  days,
  budget,
  interests,
  travelerType,
  pace,
  candidates,
  userPreferences = {}
}) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn("⚠️ GEMINI_API_KEY missing or invalid");
    return null;
  }

  // Build personalization string
  const { morning, transport, experience, packing } = userPreferences;
  let personalizationNote = "";
  if (morning) personalizationNote += `\n- User prefers ${morning} for their ideal travel morning.`;
  if (transport) personalizationNote += `\n- User's preferred mode of transport is ${transport}.`;
  if (experience) personalizationNote += `\n- User values ${experience} as their must-have travel experience.`;
  if (packing) personalizationNote += `\n- User's packing style is ${packing}.`;

  const prompt = `
Create a ${days}-day itinerary for ${city}.

Interests: ${interests.join(", ")}
Budget: ${budget} INR (total for ${travelerType})
Traveler Type: ${travelerType}
Trip Pace: ${pace}

${personalizationNote ? "### USER STYLE PREFERENCES:" + personalizationNote : ""}

Please organize the following candidate places into a cohesive daily schedule:
${JSON.stringify(candidates.map(p => ({ name: p.name, category: p.category, lat: p.lat, lng: p.lng })))}

### INSTRUCTIONS:
1. For each place, suggest a realistic "bestTime" to visit (Morning, Afternoon, Evening, or Night).
2. Provide a "timeReason" (e.g., "Cool weather", "Fewer crowds", "Active nightlife", "Best lighting").
3. IMPORTANT: Refine the "reason" for visiting each place to incorporate the User Style Preferences mentioned above where appropriate.
4. If a user prefers walking, prioritize nearby spots. If they prefer sunrise treks, ensure Day 1 or 2 starts with an early outdoor activity.

Return valid JSON:
{
  "1": [{ 
    "name": "", 
    "category": "", 
    "avgCost": 0, 
    "timeHours": 2, 
    "lat": 0, 
    "lng": 0,
    "bestTime": "Morning",
    "timeReason": "Cool weather and fewer crowds",
    "reason": "..."
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