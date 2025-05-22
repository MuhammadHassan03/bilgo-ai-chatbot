const express = require('express');
const router = express.Router();

const { getAllChats, askChatbot, updateChat, deleteChat } = require('../controllers/chatController');

// GET - Get all previous chat logs or messages
router.get('/', getAllChats);

// POST - Send user message and get response from GPT
router.post('/', askChatbot);

// PUT - (Optional) Update a saved chat (not critical in this app)
router.put('/:id', updateChat);

// DELETE - Delete a saved chat (optional)
router.delete('/:id', deleteChat);

module.exports = router;
