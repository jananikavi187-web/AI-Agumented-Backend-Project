const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  const { name, email, password } = req.body;

  try {
    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({ errors: validation.array() });
  }

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(existingUser._id);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}

async function profile(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, profile };
