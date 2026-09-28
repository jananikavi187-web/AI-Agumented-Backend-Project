const router = require('express').Router();
const { body } = require('express-validator');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const requireAuth = require('../middleware/authMiddleware');

router.post(
  '/',
  requireAuth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  createBlog
);

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

router.put(
  '/:id',
  requireAuth,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  ],
  updateBlog
);

router.delete('/:id', requireAuth, deleteBlog);

module.exports = router;
