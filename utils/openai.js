// utils/openai.js

require("dotenv").config();
const OpenAI = require("openai");

// Ensure API key is provided
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables.");
}

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configuration with sensible defaults, overridable via .env
const MODEL            = process.env.OPENAI_MODEL            || "gpt-4o-mini";
const MAX_TOKENS       = parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 150;
const TEMPERATURE      = parseFloat(process.env.OPENAI_TEMPERATURE)    || 0.7;
const TOP_P            = parseFloat(process.env.OPENAI_TOP_P)          || 0.9;
const MAX_HISTORY_MSGS = parseInt(process.env.OPENAI_MAX_HISTORY_MSGS, 10) || 20;
const SYSTEM_PROMPT    = process.env.OPENAI_SYSTEM_PROMPT             || null;

/**
 * Trim conversation history to the last N messages to control token usage.
 * @param {Array<{role: string, content: string}>} history
 * @returns {Array<{role: string, content: string}>}
 */
function trimConversation(history) {
  if (!Array.isArray(history)) return [];
  const start = history.length > MAX_HISTORY_MSGS ? history.length - MAX_HISTORY_MSGS : 0;
  return history.slice(start);
}

/**
 * Send a conversation to OpenAI and get the assistant’s reply.
 * Automatically prepends a system prompt (if provided) and trims history.
 * @param {Array<{role: string, content: string}>} history
 * @returns {Promise<{role: string, content: string}>}
 */
async function getChatbotResponse(history) {
  // Build messages list
  const messages = [];
  if (SYSTEM_PROMPT) {
    messages.push({ role: "system", content: SYSTEM_PROMPT });
  }
  const trimmed = trimConversation(history);
  messages.push(...trimmed);

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      top_p: TOP_P,
    });

    const choice = response.choices && response.choices[0] && response.choices[0].message;
    if (!choice || !choice.content) {
      throw new Error("No valid message returned from OpenAI.");
    }
    return { role: choice.role, content: choice.content.trim() };
  } catch (err) {
    console.error("[OpenAI] Completion error:", err);
    // Fallback safe response
    return {
      role: "assistant",
      content: "⚠️ I’m having trouble responding right now. Please try again later."
    };
  }
}

module.exports = {
  getChatbotResponse,
  trimConversation,
  // Exporting config constants for potential reuse
  CONFIG: {
    MODEL,
    MAX_TOKENS,
    TEMPERATURE,
    TOP_P,
    MAX_HISTORY_MSGS,
    SYSTEM_PROMPT
  }
};
