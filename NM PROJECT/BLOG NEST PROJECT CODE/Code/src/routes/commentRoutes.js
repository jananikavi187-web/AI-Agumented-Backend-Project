const router = require('express').Router();
const { body } = require('express-validator');
const {
  createComment,
  getCommentsForBlog,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const requireAuth = require('../middleware/authMiddleware');

router.post(
  '/:blogId',
  requireAuth,
  [body('text').notEmpty().withMessage('Comment text is required')],
  createComment
);

router.get('/:blogId', getCommentsForBlog);

router.put(
  '/:id',
  requireAuth,
  [body('text').optional().notEmpty().withMessage('Comment text cannot be empty')],
  updateComment
);

router.delete('/:id', requireAuth, deleteComment);

module.exports = router;
