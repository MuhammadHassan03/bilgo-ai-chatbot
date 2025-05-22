// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const morgan = require('morgan');


// Load environment variables from .env file
dotenv.config();

// Create express app
const app = express();

// Use Helmet to set secure headers
app.use(helmet());

// Enable CORS to allow frontend requests
app.use(cors());

// Log all incoming requests
app.use(morgan('combined'));

// Rate limiter to avoid abuse (max 100 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Parse incoming JSON requests
app.use(express.json());

// Serve uploads folder so frontend can access audio files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const chatRoutes = require('./routes/chat');
const transcribeRoutes = require('./routes/transcribe');
const speakRoutes = require('./routes/speak');

// Set up routes
app.use('/api/chat', chatRoutes);           // GPT chatbot route
app.use('/api/transcribe', transcribeRoutes); // Whisper speech-to-text route
app.use('/api/speak', speakRoutes);         // TTS / voice cloning route

// Optional: serve frontend static files (if needed)
app.use(express.static(path.join(__dirname, '../frontend')));

// Default route for health check or debug
app.get('/', (req, res) => {
  res.send('Bilgo AI Voice Chatbot backend is running.');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
