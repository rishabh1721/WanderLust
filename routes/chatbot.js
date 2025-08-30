// routes/chatbot.js

const express = require("express");
const asyncHandler = require('express-async-handler');
const { getChatbotResponse } = require("../utils/openai");

const router = express.Router();

// POST /chatbot - send user message and get AI response
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userMsg = (req.body.message || '').trim();
    if (!userMsg) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    // Initialize chat history in session
    if (!Array.isArray(req.session.chatHistory)) {
      req.session.chatHistory = [];
    }

    // Record user message
    req.session.chatHistory.push({ role: 'user', content: userMsg });

    try {
      // Get assistant reply
      const botMessage = await getChatbotResponse(req.session.chatHistory);
      // Ensure role and content
      if (!botMessage || !botMessage.content) {
        throw new Error('Invalid response from AI');
      }
      req.session.chatHistory.push({ role: 'assistant', content: botMessage.content });

      // Return consistent field for frontend
      res.json({ response: botMessage.content });
    } catch (err) {
      console.error('Chatbot error:', err);
      res.status(500).json({ response: "⚠️ Sorry, something went wrong. Please try again later." });
    }
  })
);

// Optional: GET /chatbot/history - retrieve current chat history
router.get(
  "/history",
  (req, res) => {
    const history = Array.isArray(req.session.chatHistory) ? req.session.chatHistory : [];
    res.json({ history });
  }
);

// Optional: DELETE /chatbot/history - clear chat history
router.delete(
  "/history",
  (req, res) => {
    req.session.chatHistory = [];
    res.json({ message: "Chat history cleared." });
  }
);

module.exports = router;
