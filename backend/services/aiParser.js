const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parsePrompt(prompt) {

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const systemPrompt = `
Extract travel details from the user request.

Return JSON ONLY like this:
{
  "days": number,
  "budget": "low | medium | high",
  "interests": ["food","temple","nature","nightlife"]
}

User prompt:
${prompt}
`;

  const result = await model.generateContent(systemPrompt);

  const text = result.response.text();

  return JSON.parse(text);
}

module.exports = parsePrompt;