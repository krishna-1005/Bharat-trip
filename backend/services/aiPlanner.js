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
  const getFallbackPlan = () => {
    const it = {};
    for (let i = 1; i <= days; i++) {
      it[i] = candidates.slice((i - 1) * 3, i * 3).map(c => ({
        ...c,
        bestTime: ["Morning", "Afternoon", "Evening"][Math.floor(Math.random() * 3)],
        reason: "Highly rated spot matching your interest.",
        estimatedCost: c.avgCost || 0,
        estimatedHours: c.timeHours || 2
      }));
    }
    return {
      summary: `A curated ${days}-day trip to ${city} focusing on ${interests.join(", ")}.`,
      itinerary: Object.entries(it).map(([day, places]) => ({ day: `Day ${day}`, places }))
    };
  };

  try {
    const Groq = require("groq-sdk");
    if (!process.env.GROQ_API_KEY) {
      console.warn("⚠️ GROQ_API_KEY missing. Falling back to local logic.");
      return getFallbackPlan();
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const systemPrompt = `
You are the GoTripo Itinerary Optimizer.
STRICT RULE: ONLY suggest attractions, landmarks, and activities located within ${city}.
DO NOT suggest any places from other states or cities (e.g., if the destination is in Kerala, DO NOT suggest places in Bengaluru/Karnataka).

Instructions:
1. Optimize the itinerary for a ${days}-day trip to ${city}.
2. Use the provided "candidates" as the primary source of truth for location names and coordinates.
3. If a candidate's name or metadata clearly indicates it's in a different city (e.g., has "Bengaluru" in the name but the destination is "Kerala"), EXCLUDE IT.
4. Group nearby places together for each day to minimize travel time.
5. Provide a concise summary of the trip.

Return ONLY valid JSON in this structure:
{
  "summary": "...",
  "itinerary": {
    "Day 1": [ { "name": "...", "bestTime": "Morning/Afternoon/Evening", "reason": "...", "lat": ..., "lng": ... } ],
    ...
  }
}
`;

    const candidatesContext = candidates.map(c => 
      `Name: ${c.name}, Category: ${c.category}, Tags: ${(c.tags || []).join(",")}, Lat: ${c.lat}, Lng: ${c.lng}`
    ).join("\n");

    const userPrompt = `
Destination: ${city}
Days: ${days}
Budget: ${budget}
Interests: ${interests.join(", ")}
Traveler Type: ${travelerType}
Pace: ${pace}

Available Candidates for ${city}:
${candidatesContext}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(chatCompletion.choices[0].message.content);

    if (data && data.itinerary) {
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
    }
    
    return getFallbackPlan();

  } catch (err) {
    console.error("Groq Planning Error:", err.message);
    return getFallbackPlan();
  }
}

/**
 * Suggest destinations based on vibe parameters.
 */
async function getVibeSuggestions({ adventure, modern, social }) {
  const fallbacks = [
    { name: "Leh, Ladakh", region: "North India", icon: "mountain", vibe: "Extreme Adventure", adventure: 90, modern: 10, social: 30 },
    { name: "Goa", region: "West India", icon: "palmtree", vibe: "Social & Beach", adventure: 40, modern: 60, social: 90 },
    { name: "Varanasi", region: "North India", icon: "landmark", vibe: "Ancient & Spiritual", adventure: 20, modern: 10, social: 70 },
    { name: "Bengaluru", region: "South India", icon: "building", vibe: "Modern & Tech", adventure: 30, modern: 90, social: 80 },
    { name: "Rishikesh", region: "North India", icon: "wind", vibe: "Peace & Yoga", adventure: 70, modern: 20, social: 40 },
    { name: "Mumbai", region: "West India", icon: "city", vibe: "Modern & Fast", adventure: 30, modern: 95, social: 95 },
    { name: "Hampi", region: "South India", icon: "castle", vibe: "Ancient Ruins", adventure: 50, modern: 5, social: 30 },
    { name: "Auroville", region: "South India", icon: "sun", vibe: "Solitude & Peace", adventure: 10, modern: 40, social: 20 },
  ];

  try {
    const Groq = require("groq-sdk");
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY missing, using fallback suggestions.");
      return getLocalSuggestions({ adventure, modern, social }, fallbacks);
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Normalize vibes into descriptive terms
    const adventureVibe = adventure > 50 ? "Adventure & Thrill" : "Peace & Relaxation";
    const modernityVibe = modern > 50 ? "Modern & Futuristic" : "Ancient & Heritage";
    const socialVibe = social > 50 ? "Social & Party" : "Solitude & Quiet";

    const prompt = `
Suggest 3 Indian travel destinations for a traveler who wants:
- ${adventureVibe} (Score: ${adventure}/100)
- ${modernityVibe} (Score: ${modern}/100)
- ${socialVibe} (Score: ${social}/100)

Return a JSON object with a "suggestions" key containing an array of 3 objects.
Each object: { "name": "...", "region": "...", "icon": "one of [mountain, palmtree, landmark, building, wind, city, castle, sun, music, trees]", "vibe": "catchy vibe desc" }
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(chatCompletion.choices[0].message.content);
    const suggestions = data.suggestions || data.destinations || (Array.isArray(data) ? data : []);
    
    if (suggestions.length > 0) return suggestions;
    return getLocalSuggestions({ adventure, modern, social }, fallbacks);

  } catch (err) {
    console.error("Vibe Suggestion Error:", err.message);
    return getLocalSuggestions({ adventure, modern, social }, fallbacks);
  }
}

function getLocalSuggestions(vibe, fallbacks) {
  // Simple scoring based on Euclidean distance in vibe-space
  return fallbacks
    .map(dest => {
      const score = Math.sqrt(
        Math.pow(dest.adventure - vibe.adventure, 2) +
        Math.pow(dest.modern - vibe.modern, 2) +
        Math.pow(dest.social - vibe.social, 2)
      );
      return { ...dest, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(({ score, ...rest }) => rest);
}

/**
 * Interpret a natural language dream and suggest destinations.
 */
async function getDreamWeaverSuggestions(promptText) {
  const fallbacks = [
    { name: "Munnar", region: "Kerala", icon: "trees", reason: "Misty tea gardens and serene atmosphere matching your dream." },
    { name: "Gulmarg", region: "Kashmir", icon: "mountain", reason: "Snow-covered peaks and ethereal white landscapes." },
    { name: "Coorg", region: "Karnataka", icon: "coffee", reason: "Lush coffee plantations and waking up to the sound of birds." },
  ];

  try {
    const Groq = require("groq-sdk");
    if (!process.env.GROQ_API_KEY) {
      return fallbacks;
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const systemPrompt = `
You are the GoTripo Dream Weaver. A user will describe their dream travel morning or atmosphere.
Interpret their feelings and suggest 3 unique Indian destinations.
Return ONLY valid JSON in this structure:
{
  "suggestions": [
    { 
      "name": "City Name", 
      "region": "State", 
      "icon": "one of [mountain, palmtree, landmark, building, wind, city, castle, sun, music, trees, coffee, waves, cloud-sun]", 
      "reason": "One sentence why this matches their dream",
      "imageHint": "A descriptive prompt for a background image (e.g., 'A misty morning over a lake with pine trees')"
    }
  ]
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptText }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(chatCompletion.choices[0].message.content);
    const suggestions = data.suggestions || data.destinations || (Array.isArray(data) ? data : []);
    
    return suggestions.length > 0 ? suggestions : fallbacks;

  } catch (err) {
    console.error("Dream Weaver Error:", err);
    return fallbacks;
  }
}

module.exports = { analyzeAndRefinePlan, getVibeSuggestions, getDreamWeaverSuggestions };
