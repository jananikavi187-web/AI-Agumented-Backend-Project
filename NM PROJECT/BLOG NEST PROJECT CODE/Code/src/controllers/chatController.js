const { validationResult } = require('express-validator');
const { chatWithGemini } = require('../services/geminiService');
const Chat = require('../models/Chat');

const MAX_HISTORY_MESSAGES = 20; // cap context sent to Gemini per request

async function sendMessage(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  try {
    const { message } = req.body;
    const userId = req.user._id;

    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = await Chat.create({ user: userId, messages: [] });
    }

    const recentHistory = chat.messages
      .slice(-MAX_HISTORY_MESSAGES)
      .map(({ role, content }) => ({ role, content }));

    const reply = await chatWithGemini(recentHistory, message);

    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'model', content: reply });
    await chat.save();

    return res.status(200).json({
      reply,
      messages: chat.messages,
    });
  } catch (err) {
    return next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const chat = await Chat.findOne({ user: req.user._id });
    return res.status(200).json({ messages: chat ? chat.messages : [] });
  } catch (err) {
    return next(err);
  }
}

async function clearHistory(req, res, next) {
  try {
    await Chat.findOneAndUpdate(
      { user: req.user._id },
      { $set: { messages: [] } },
      { upsert: true }
    );
    return res.status(200).json({ message: 'Chat history cleared' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { sendMessage, getHistory, clearHistory };
