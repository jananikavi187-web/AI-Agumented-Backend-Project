const router = require('express').Router();
const { body } = require('express-validator');
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatController');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

router.post(
  '/message',
  [body('message').notEmpty().withMessage('Message is required')],
  sendMessage
);

router.get('/history', getHistory);

router.delete('/history', clearHistory);

module.exports = router;
