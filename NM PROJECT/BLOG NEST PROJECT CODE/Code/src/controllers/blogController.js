const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');

function isOwner(blog, userId) {
  return blog.author.toString() === userId.toString();
}

async function createBlog(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  try {
    const { title, content, category } = req.body;

    const newBlog = await Blog.create({
      title,
      content,
      category,
      author: req.user._id,
      authorName: req.user.name,
    });

    return res.status(201).json(newBlog);
  } catch (err) {
    return next(err);
  }
}

async function getAllBlogs(req, res, next) {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.json(blogs);
  } catch (err) {
    return next(err);
  }
}

async function getBlogById(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    return res.json(blog);
  } catch (err) {
    return next(err);
  }
}

async function updateBlog(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (!isOwner(blog, req.user._id)) {
      return res.status(403).json({ message: 'You are not allowed to edit this blog' });
    }

    const { title, content, category } = req.body;
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (category) blog.category = category;

    await blog.save();
    return res.json(blog);
  } catch (err) {
    return next(err);
  }
}

async function deleteBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (!isOwner(blog, req.user._id)) {
      return res.status(403).json({ message: 'You are not allowed to delete this blog' });
    }

    await blog.deleteOne();
    return res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog };
