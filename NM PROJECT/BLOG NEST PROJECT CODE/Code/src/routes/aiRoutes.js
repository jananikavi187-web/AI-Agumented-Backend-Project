const router = require('express').Router();
const { body } = require('express-validator');
const { generateBlog, summarizeBlog } = require('../controllers/aiController');
const requireAuth = require('../middleware/authMiddleware');

router.post(
  '/generate-blog',
  requireAuth,
  [
    body('topic').notEmpty().withMessage('Topic is required'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  ],
  generateBlog
);

router.post(
  '/summarize',
  [body('content').notEmpty().withMessage('Content is required')],
  summarizeBlog
);

module.exports = router;
