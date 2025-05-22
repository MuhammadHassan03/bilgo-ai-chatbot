const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Load static property knowledge base
const propertyDataPath = path.join(
  __dirname,
  "../data/property_knowledge_base.json"
);
const properties = JSON.parse(fs.readFileSync(propertyDataPath, "utf-8"));

async function translateToEnglish(text) {
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Translate the following Arabic query into English for keyword extraction.",
          },
          { role: "user", content: text },
        ],
        max_tokens: 60,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Translation error:", err.message);
    return text; // fallback
  }
}

async function extractSearchFilters(userQuery) {
  const systemPrompt = `
You are an expert real estate assistant.

Your job is to extract structured search fields from user messages.

Return a JSON with any of the following keys:
- location (array of strings)
- bedrooms (number)
- bathrooms (number)
- price_range (string)
- amenities (array of strings)
- type (string)

Only include fields that are clearly mentioned. Do NOT make assumptions.
Return valid JSON only.
  `.trim();

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return JSON.parse(res.data.choices[0].message.content);
  } catch (err) {
    console.error("Field extraction error:", err.message);
    return {};
  }
}

// Utility: Find related properties using simple keyword matching
// const findRelevantProperties = (query, limit = 3) => {
//   const lowerQuery = query.toLowerCase();
//   return properties
//     .filter(
//       (p) =>
//         p.title.toLowerCase().includes(lowerQuery) ||
//         p.description.toLowerCase().includes(lowerQuery) ||
//         p.location.toLowerCase().includes(lowerQuery)
//     )
//     .slice(0, limit);
// };
const findRelevantProperties = (query, limit = 3) => {
  const keywords = query.toLowerCase().match(/\w+/g) || [];

  const hasLocation = (property, keywords) => {
    return keywords.some((kw) => property.location.toLowerCase().includes(kw));
  };

  const locationMatches = properties.filter((p) => hasLocation(p, keywords));
  if (locationMatches.length > 0) return locationMatches.slice(0, limit);

  // Fallback: match by general keywords
  return properties
    .filter((p) => {
      const haystack = [
        p.title,
        p.description,
        p.location,
        p.type,
        ...(p.amenities || []),
      ]
        .join(" ")
        .toLowerCase();
      return keywords.some((kw) => haystack.includes(kw));
    })
    .slice(0, limit);
};

// GET /api/chat - Return dummy log or future chat logs
exports.getAllChats = async (req, res) => {
  try {
    res.status(200).json({
      message: "This would return saved chat logs (not implemented yet).",
    });
  } catch (error) {
    console.error("GetAllChats Error:", error);
    res.status(500).json({ error: "Failed to fetch chats." });
  }
};

// POST /api/chat - Main chatbot logic with RAG
exports.askChatbot = async (req, res) => {
  const { message, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    let searchText = message;

    if (language === "ar") {
      const translated = await translateToEnglish(message);
      searchText = translated;
    }

    const filters = await extractSearchFilters(searchText);

    const matches = properties
      .filter((p) => {
        const matchesLocation =
          !filters.location ||
          filters.location.some((loc) =>
            p.location.toLowerCase().includes(loc.toLowerCase())
          );
        const matchesBedrooms =
          !filters.bedrooms || p.bedrooms === filters.bedrooms;
        const matchesType =
          !filters.type ||
          p.type.toLowerCase().includes(filters.type.toLowerCase());
        const matchesAmenities =
          !filters.amenities ||
          filters.amenities.every((a) =>
            p.amenities.map((am) => am.toLowerCase()).includes(a.toLowerCase())
          );

        return (
          matchesLocation && matchesBedrooms && matchesType && matchesAmenities
        );
      })
      .slice();

    const context = matches
      .map(
        (p) =>
          `Title: ${p.title}\nLocation: ${p.location}\nPrice: ${p.price}\nType: ${p.type}\nSize: ${p.size_sqm} sqm\nAmenities: ${p.amenities.join(", ")}\nDescription: ${p.description}`
      )
      .join("\n---\n");
    const fullPrompt = `
      You are Bilgo, a helpful real estate assistant. You work with a RAG-based system, and the only information you can use is the property listings provided below.

      Your answers will be converted to speech (TTS) and then transcribed back to text, so speak clearly and naturally as if you're talking to someone.

      Never use bullet points or numbered lists. Always speak in full sentences and conversational paragraphs, as if talking to someone in person. Describe the properties naturally, flowing from one to the next.

      ${
        language === "ar"
          ? "IMPORTANT: Reply in Arabic using natural, conversational language. Use Arabic numerals (١, ٢, ٣) and be culturally clear for Arabic-speaking users. Identify yourself as Bilgo."
          : "IMPORTANT: Reply in English using clear, human-friendly language. Identify yourself as Bilgo."
      }

      ${
        context
          ? `Here are the property listings you can reference:\n\n${context}\n\nOnly answer questions based on the listings above.`
          : `Currently, there are no property listings available. Politely inform the user that no properties are in the system.`
      }

      When the user asks about a location, property type, amenities, or prices, refer to the exact listings — mention their title, type, and location clearly in your answer if relevant.

      User: ${message}

      Bilgo:
      `.trim();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
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
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5173",
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
