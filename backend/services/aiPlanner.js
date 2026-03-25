const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function analyzeAndRefinePlan({
  city,
  days,
  budget,
  interests,
  travelerType,
  pace,
  candidates
}) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY missing");
    return null;
  }

  const prompt = `
Create a ${days}-day itinerary for ${city}.

Interests: ${interests.join(", ")}
Budget: ${budget}
Traveler: ${travelerType}
Pace: ${pace}

Return JSON:
{
  "1": [{ "name": "", "category": "", "avgCost": 0, "timeHours": 2, "lat": 0, "lng": 0 }]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const text = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);

  } catch (err) {
    console.error("AI Planning Error:", err.message);
    return null;
  }
}

module.exports = analyzeAndRefinePlan;