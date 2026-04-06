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
  userPreferences = {},
  language = "English"
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

  const languageInstruction = language === "Hindi" 
    ? "IMPORTANT: You MUST return all text content (name, timeReason, reason) in Hindi (Hindi script/Devanagari). The JSON keys must remain in English." 
    : "Return all text content in English.";

  const prompt = `
Create a comprehensive ${days}-day travel itinerary for ${city} in ${language}.

### TRIP CONSTRAINTS:
- Interests: ${interests.join(", ")}
- Total Budget: ${budget} INR (Covers activities for ALL ${travelerType} travelers).
- Traveler Type: ${travelerType}
- Trip Pace: ${pace} (Ensure the number of activities matches this pace).

${languageInstruction}

${personalizationNote ? "### USER STYLE PREFERENCES:" + personalizationNote : ""}

### CANDIDATE PLACES TO USE:
${JSON.stringify(candidates.map(p => ({ name: p.name, category: p.category, avgCost: p.avgCost })))}

### CRITICAL INSTRUCTIONS:
1. VOLUME: You MUST include at least 3-4 diverse places/activities per day. Do not leave the user with empty time.
2. BUDGET: The total "avgCost" of all suggested places MUST stay below ${Math.round(budget * 0.8)} INR.
3. For each place, suggest a realistic "bestTime" (Morning, Afternoon, Evening, Night) and a "timeReason".
4. Incorporation: Use the provided candidates as much as possible to build the days.
5. Return ONLY valid JSON.

Return valid JSON:
{
  "1": [
    { 
      "name": "Place Name", 
      "category": "Category", 
      "avgCost": 0, 
      "timeHours": 2, 
      "bestTime": "Morning",
      "timeReason": "Reason for timing",
      "reason": "Personalized reason why user will like this"
    }
  ],
  "2": [...]
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