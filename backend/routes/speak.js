const express = require('express');
const router = express.Router();

const { speakText } = require('../controllers/ttsController');

router.post('/', speakText);

module.exports = router;