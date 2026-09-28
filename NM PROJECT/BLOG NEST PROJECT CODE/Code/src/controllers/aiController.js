const { validationResult } = require('express-validator');
const { callGemini } = require('../services/geminiService');
const Blog = require('../models/Blog');

const CATEGORY_KEYWORDS = [
  { category: 'Technology', keywords: ['ai', 'technology', 'software', 'programming', 'cloud'] },
  { category: 'Education', keywords: ['learning', 'school', 'education', 'teaching', 'study'] },
  { category: 'Health', keywords: ['health', 'fitness', 'medicine', 'wellness', 'mental'] },
  { category: 'Sports', keywords: ['sports', 'football', 'basketball', 'soccer', 'athlete'] },
  { category: 'Lifestyle', keywords: ['lifestyle', 'fashion', 'travel', 'home', 'beauty'] },
  { category: 'Business', keywords: ['business', 'startup', 'finance', 'economy', 'marketing'] },
  { category: 'Travel', keywords: ['travel', 'tourism', 'destination', 'adventure', 'holiday'] },
  { category: 'Finance', keywords: ['money', 'investment', 'stocks', 'banking', 'crypto'] },
  { category: 'Entertainment', keywords: ['entertainment', 'movies', 'music', 'celebrity', 'gaming'] },
];

function stripFormatting(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*[*\-+]\s*/gm, '')
    .replace(/\*{1,3}(.+?)\*{1,3}/g, '$1')
    .replace(/[*_]{2,}/g, '')
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function guessCategory(topic) {
  const lowerTopic = topic.toLowerCase();
  const found = CATEGORY_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => lowerTopic.includes(keyword))
  );
  return found ? found.category : 'Unidentified';
}

async function generateBlog(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  try {
    const { topic, category } = req.body;
    const prompt = `Write a blog post about ${topic}. Include a strong introduction, key points of engaging content, and a conclusion. Do not include markdown headings, asterisks, or extra formatting. Give final output in only 100-150 words.`;

    const rawResult = await callGemini(prompt);
    const content = stripFormatting(rawResult);
    const finalCategory = category || guessCategory(topic);

    const newBlog = await Blog.create({
      title: `Guide to ${topic}`,
      content,
      category: finalCategory,
      author: req.user._id,
      authorName: req.user.name,
    });

    return res.status(201).json(newBlog);
  } catch (err) {
    return next(err);
  }
}

async function summarizeBlog(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  try {
    const { content } = req.body;
    const prompt = `Summarize the following blog content in a short, easy-to-read paragraph:\n\n${content}`;
    const rawSummary = await callGemini(prompt);

    return res.json({ summary: stripFormatting(rawSummary) });
  } catch (err) {
    return next(err);
  }
}

module.exports = { generateBlog, summarizeBlog };
