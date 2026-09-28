const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_MODEL = 'gemini-1.5-flash';

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const configuredModel = process.env.GEMINI_MODEL;
  const modelName = !configuredModel || configuredModel === 'gemini-1.5' ? DEFAULT_MODEL : configuredModel;

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Invalid Gemini response');
    }

    return responseText;
  } catch (err) {
    console.error('Gemini API Error:', err.message);
    throw err;
  }
}

async function chatWithGemini(history, message) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const configuredModel = process.env.GEMINI_MODEL;
  const modelName = !configuredModel || configuredModel === 'gemini-1.5' ? DEFAULT_MODEL : configuredModel;

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });

    // history: [{ role: 'user' | 'model', content: '...' }, ...]
    const formattedHistory = history.map((entry) => ({
      role: entry.role,
      parts: [{ text: entry.content }],
    }));

    const chatSession = model.startChat({ history: formattedHistory });
    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Invalid Gemini response');
    }

    return responseText;
  } catch (err) {
    console.error('Gemini Chat Error:', err.message);
    throw err;
  }
}

module.exports = { callGemini, chatWithGemini };
