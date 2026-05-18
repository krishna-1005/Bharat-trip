const Groq = require("groq-sdk");

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Generate viral content using AI
 * @param {Object} params
 */
exports.generateContent = async ({ topic, platform, contentType, tone, videoDuration }) => {
  if (!groq) {
    throw new Error("AI Service (Groq) not configured");
  }

  const systemPrompt = `
You are GoTripo's elite viral content strategist.

Your role:
- Generate modern short-form travel content
- Create emotionally compelling hooks
- Optimize for engagement and shares
- Think like a top travel creator brand
- Avoid robotic AI wording
- Use Gen-Z and startup-style social language naturally

Output must be:
- concise
- highly engaging
- visually descriptive
- platform optimized

Format your response as a JSON object with the following structure:
{
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "reelScript": [{"scene": 1, "visual": "visual description", "audio": "audio/voiceover description"}],
  "storyboard": [{"shot": 1, "description": "shot description"}],
  "caption": "The social media caption",
  "hashtags": ["tag1", "tag2"],
  "thumbnailConcept": "Visual description for thumbnail",
  "viralityScore": 85,
  "engagementPrediction": "High engagement expected due to trending topic and emotional hook."
}

Platform: ${platform}
Content Type: ${contentType}
Tone: ${tone}
Duration: ${videoDuration || 'N/A'}

Do not include markdown formatting like \`\`\`json. Return pure JSON.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate viral content for topic: ${topic}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Content Engine Service Error:", error);
    throw error;
  }
};
