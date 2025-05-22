const express = require('express');
const router = express.Router();

const { uploadAudio, transcribeAudio } = require('../controllers/transcribeController');

// POST /api/transcribe - upload audio and get transcription
router.post('/', uploadAudio, transcribeAudio);

module.exports = router;