const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { AssemblyAI } = require('assemblyai');

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY, 
});

// Set up multer storage config (store in memory or temp folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Middleware for uploading audio
exports.uploadAudio = upload.single("audio");

// POST /api/transcribe - Transcribes audio using Whisper
exports.transcribeAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded." });
  }

  try {
    // Upload local file to AssemblyAI
    const uploadResponse = await client.files.upload(fs.createReadStream(req.file.path));
    console.log('uploadResponse', uploadResponse)
    const transcript = await client.transcripts.transcribe({
      audio_url: uploadResponse,
      speech_model: "universal",
    });

    let completedTranscript = transcript;
    while (completedTranscript.status === "processing" || completedTranscript.status === "queued") {
      await new Promise((r) => setTimeout(r, 3000)); // wait 3 seconds
      completedTranscript = await client.transcripts.get(completedTranscript.id);
    }

    fs.unlinkSync(req.file.path); // Delete local file after done

    if (completedTranscript.status === "completed") {
      return res.status(200).json({ text: completedTranscript.text });
    } else {
      return res.status(500).json({ error: "Transcription failed." });
    }

  } catch (error) {
    console.error("Transcription Error:", error);
    res.status(500).json({ error: "Failed to transcribe audio." });
  }
};