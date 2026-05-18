const contentEngineService = require("../services/contentEngineService");
const GeneratedContent = require("../models/GeneratedContent");

exports.generateContent = async (req, res) => {
  const { topic, platform, contentType, tone, videoDuration } = req.body;

  if (!topic || !platform || !contentType || !tone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const generatedOutput = await contentEngineService.generateContent({
      topic,
      platform,
      contentType,
      tone,
      videoDuration
    });

    const newContent = await GeneratedContent.create({
      topic,
      platform,
      contentType,
      tone,
      videoDuration,
      generatedOutput
    });

    res.status(201).json({
      success: true,
      data: newContent
    });
  } catch (error) {
    console.error("AI Content Engine Controller Error:", error);
    res.status(500).json({
      error: "Failed to generate content",
      message: error.message
    });
  }
};

exports.getAllContent = async (req, res) => {
  try {
    const content = await GeneratedContent.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch content history" });
  }
};

exports.updateContentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, isFavorite, scheduledAt } = req.body;

  try {
    const updatedContent = await GeneratedContent.findByIdAndUpdate(
      id,
      { status, isFavorite, scheduledAt },
      { new: true }
    );

    if (!updatedContent) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedContent
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update content" });
  }
};

exports.deleteContent = async (req, res) => {
  const { id } = req.params;
  try {
    await GeneratedContent.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Content deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete content" });
  }
};
