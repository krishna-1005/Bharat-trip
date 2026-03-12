const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates realistic reviews for a place using Gemini AI.
 * If API key is missing or fails, returns stable mock reviews.
 */
async function generateReviews(placeName, category) {
  // If no key at all, immediate fallback
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getMockReviews(placeName);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Set a short timeout for the AI generation so it doesn't hang
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Generate 3 original user reviews for ${placeName} (${category}) in Bengaluru. Return ONLY JSON: [{"author": "Name", "rating": 5, "comment": "Text"}]` }] }],
      generationConfig: { maxOutputTokens: 200 }
    });

    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    // This is where the "API key expired" error is caught
    // We log it but return the mock reviews so the UI stays functional
    console.log(`Note: Using fallback reviews for ${placeName} (AI Key issue: ${error.message.substring(0, 50)}...)`);
    return getMockReviews(placeName);
  }
}

function getMockReviews(name) {
  // Stable pseudo-random reviews based on name
  const reviewers = ["Arjun Mehta", "Priya Sharma", "Rohan Das", "Ananya Iyer", "Vikram Singh"];
  const comments = [
    "Amazing experience! Highly recommend visiting this place.",
    "Decent spot, but it gets a bit crowded on weekends.",
    "A must-visit in Bengaluru. The atmosphere is wonderful.",
    "Good value for money and very well maintained.",
    "Loved the vibe here! Perfect for a quick outing."
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  return [
    {
      author: reviewers[absHash % reviewers.length],
      rating: 4 + (absHash % 2),
      comment: comments[absHash % comments.length]
    },
    {
      author: reviewers[(absHash + 1) % reviewers.length],
      rating: 3 + (absHash % 3),
      comment: comments[(absHash + 1) % comments.length]
    }
  ];
}

module.exports = { generateReviews };
