const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const path = req.path ?? ''; // path hiện tại
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied',
        originUrl: path,
        redirectUrl: path.startsWith('/api') ? null : '/login',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found, authorization denied',
        originUrl: path,
        redirectUrl: path.startsWith('/api') ? null : '/login',
      });
    }

    // Add user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        originUrl: path,
        redirectUrl: path.startsWith('/api') ? null : '/login',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        originUrl: path,
        redirectUrl: path.startsWith('/api') ? null : '/login',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      originUrl: path,
      redirectUrl: path.startsWith('/api') ? null : '/login',
    });
  }
};

module.exports = auth;
