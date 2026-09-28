const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

function isOwner(comment, userId) {
  return comment.author.toString() === userId.toString();
}

async function createComment(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  try {
    const parentBlog = await Blog.findById(req.params.blogId);
    if (!parentBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const { text } = req.body;
    const newComment = await Comment.create({
      text,
      blog: parentBlog._id,
      author: req.user._id,
      authorName: req.user.name,
    });

    return res.status(201).json(newComment);
  } catch (err) {
    return next(err);
  }
}

async function getCommentsForBlog(req, res, next) {
  try {
    const parentBlog = await Blog.findById(req.params.blogId);
    if (!parentBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comments = await Comment.find({ blog: parentBlog._id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (err) {
    return next(err);
  }
}

async function updateComment(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!isOwner(comment, req.user._id)) {
      return res.status(403).json({ message: 'You are not allowed to edit this comment' });
    }

    const { text } = req.body;
    if (text) comment.text = text;

    await comment.save();
    return res.json(comment);
  } catch (err) {
    return next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!isOwner(comment, req.user._id)) {
      return res.status(403).json({ message: 'You are not allowed to delete this comment' });
    }

    await comment.deleteOne();
    return res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createComment, getCommentsForBlog, updateComment, deleteComment };
