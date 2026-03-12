const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates realistic reviews for a place using Gemini AI.
 * If API key is missing or fails, returns stable mock reviews.
 */
async function generateReviews(placeName, category) {
  if (!process.env.GEMINI_API_KEY) {
    return getMockReviews(placeName);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Generate 3 original, diverse, and realistic user reviews for a place in Bengaluru, India.
      Place Name: ${placeName}
      Category: ${category}

      Requirements:
      1. One positive (4-5 stars), one neutral (3 stars), and one very positive (5 stars).
      2. Mention specific details typical for this category (e.g., if it's a park, mention greenery; if it's a restaurant, mention food).
      3. Use diverse Indian names for reviewers.
      4. Keep each review under 150 characters.
      5. Return ONLY a JSON array of objects with "author", "rating" (number), and "comment".

      Format:
      [
        {"author": "Name", "rating": 5, "comment": "Text"},
        ...
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error(`Error generating reviews for ${placeName}:`, error.message);
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
