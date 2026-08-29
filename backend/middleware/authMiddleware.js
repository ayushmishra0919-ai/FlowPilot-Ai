const jwt = require('jsonwebtoken');
const { Users } = require('../services/storeAdapter');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No access token provided.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'flowpilot_jwt_secret_dev_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await Users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
      error: error.message
    });
  }
};

module.exports = { protect };
