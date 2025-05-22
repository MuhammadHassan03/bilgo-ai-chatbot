# Bilgo Voice Chatbot

A multilingual voice-enabled real estate chatbot built with Next.js and OpenAI API. It uses a Retrieval-Augmented Generation (RAG) approach to answer user queries about properties from a knowledge base of 100+ listings. Supports both Arabic and English with speech recognition and natural text-to-speech.

---

## Features

- Conversational real estate assistant with a knowledge base of 100+ properties
- Multilingual support: Arabic and English, including clear, natural speech synthesis
- Voice input with transcription powered by OpenAI Whisper API
- Text and voice output with realistic speech synthesis using browser TTS
- RAG-based answering: chatbot retrieves relevant property data before generating responses
- Simple, responsive UI with easy language switching
- Randomized property selection when listing available properties
- Error handling and user-friendly messages in both languages

---

## Getting Started

### Prerequisites

- Node.js (v16 or newer recommended)

### Installation

```bash
git clone https://github.com/MuhammadHassan03/bilgo-ai-chatbot
cd bilgo-ai-chatbot

$$ Setup Frontend
---bash
cd frontend
pnpm install
# or
npm install
# or
yarn install

$$ Run Frontend
--- bash
pnpm run dev
# or
npm run dev
# or
yarn dev

$$ Setup Backend
---bash
cd backend
pnpm install
# or
npm install
# or
yarn install

$$ Run Frontend
--- bash
node server.js