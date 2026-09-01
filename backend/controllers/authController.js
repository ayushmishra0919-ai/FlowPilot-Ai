/**
 * FlowPilot AI Auth Controller
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Users } = require('../services/storeAdapter');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'flowpilot_jwt_secret_dev_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await Users.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await Users.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'admin'
    });

    const token = generateToken(user._id || user.id);
    const userData = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: userData,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await Users.findOne({ email: normalizedEmail });

    // Ensure default demo admin user exists even on a fresh serverless cold-start
    if (!user && (normalizedEmail === 'demo@flowpilot.ai' || normalizedEmail === 'admin@flowpilot.ai')) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      user = await Users.create({
        _id: 'user-admin-001',
        name: 'Alex Vance',
        email: normalizedEmail,
        passwordHash,
        role: 'admin'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id || user.id);
    const userData = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userData,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const userData = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      user: userData,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
