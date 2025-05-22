const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Load static property knowledge base
const propertyDataPath = path.join(
  __dirname,
  "../data/property_knowledge_base.json"
);
const properties = JSON.parse(fs.readFileSync(propertyDataPath, "utf-8"));

// Utility: Find related properties using simple keyword matching
const findRelevantProperties = (query, limit = 3) => {
  const lowerQuery = query.toLowerCase();
  return properties
    .filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.location.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit);
};

// GET /api/chat - Return dummy log or future chat logs
exports.getAllChats = async (req, res) => {
  try {
    res
      .status(200)
      .json({
        message: "This would return saved chat logs (not implemented yet).",
      });
  } catch (error) {
    console.error("GetAllChats Error:", error);
    res.status(500).json({ error: "Failed to fetch chats." });
  }
};

// POST /api/chat - Main chatbot logic with RAG
exports.askChatbot = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const relevantProps = findRelevantProperties(message);

    const context = relevantProps
      .map(
        (p) =>
          `Title: ${p.title}\nLocation: ${p.location}\nPrice: ${p.price}\nType: ${p.type}\nSize: ${p.size_sqm} sqm\nAmenities: ${p.amenities.join(", ")}\nDescription: ${p.description}`
      )
      .join("\n---\n");
    const fullPrompt = `
    You are a helpful real estate assistant working with a RAG-based system that uses property listings as the only knowledge source. Your responses will be delivered via an API, converted to speech (TTS), and then transcribed back to text.

    Please keep your answers clear, accurate, and concise. Avoid any unnecessary filler or mistakes. Respond naturally, as if speaking to someone in conversation, so the transcription captures a smooth and engaging tone. Do not use long lists or bullet points—use flowing paragraphs instead.

    ${
      context
        ? `Here are the property listings you can use:\n\n${context}\n\nUse only these listings to answer the user's questions. Do not add or invent any information beyond what is provided.`
        : `Currently, there are no property listings available in the system. Please politely inform the user that no data is available and offer to help with any general real estate questions, without making assumptions or fabricating details.`
    }

    Keep in mind that the user might ask about locations, amenities, or property details, so answer based strictly on the given data or general knowledge if no listings exist.

    User: ${message}

    Assistant:
    `.trim();

    console.log("fullPrompt", fullPrompt);
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // or try 'mistralai/mixtral-8x7b', 'anthropic/claude-3-sonnet', etc.
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for real estate queries.",
          },
          { role: "user", content: fullPrompt },
        ],
        max_tokens: 512,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // set in .env
          "HTTP-Referer": "http://localhost:5173", // required by OpenRouter (your frontend origin)
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ response: reply });
  } catch (error) {
    console.error("askChatbot Error:", error?.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Failed to process message with OpenRouter." });
  }
};
// PUT /api/chat/:id - Placeholder for update
exports.updateChat = async (req, res) => {
  try {
    res.status(200).json({ message: `Chat ${req.params.id} updated (mock).` });
  } catch (error) {
    console.error("updateChat Error:", error);
    res.status(500).json({ error: "Failed to update chat." });
  }
};

// DELETE /api/chat/:id - Placeholder for delete
exports.deleteChat = async (req, res) => {
  try {
    res.status(200).json({ message: `Chat ${req.params.id} deleted (mock).` });
  } catch (error) {
    console.error("deleteChat Error:", error);
    res.status(500).json({ error: "Failed to delete chat." });
  }
};
