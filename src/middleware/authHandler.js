const jwt = require('jsonwebtoken');

const { default: config } = require('../config/config');
const { default: User } = require('@/models/user.model');

/**
 * Check if the user is authenticated
 * @param {*} req
 * @param {{message:string}} errorRef Object to hold error message reference
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
const isAuthenticated = async (req, errorRef = {}) => {
  req.isAuthenticated = false;
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')?.trim();
    if (!token) {
      errorRef.message = 'No authentication token, access denied';
      return false;
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      errorRef.message = 'User not found, authorization denied';
      return false;
    }

    req.isAuthenticated = true;
    req.user = user;
    req.userId = user.id || user._id;
    return true;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      errorRef.message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      errorRef.message = 'Token expired';
    } else {
      errorRef.message = 'Server error during authentication';
    }
    return false;
  }
};

/**
 * Middleware to protect API routes
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {Promise<void>}
 */
const apiAuthHandler = async (req, res, next) => {
  const { baseUrl, originalUrl, path, params, query, secret } = req || {};
  const redirectUrl = originalUrl.startsWith('/api') ? null : '/login';
  const errorRef = {};

  try {
    if (!(await isAuthenticated(req, errorRef))) {
      return res.status(401).json({
        success: false,
        message: errorRef.message || 'No authentication token, access denied',
        originUrl: path,
        redirectUrl: redirectUrl,
      });
    }

    // if (process.env.NODE_ENV !== 'production') {
    //   console.log("🚀 QuyNH: apiAuthHandler -> errorRef", errorRef);
    //   console.log("🚀 QuyNH: apiAuthHandler -> req.userId", req['userId']);
    //   console.log("🚀 QuyNH: apiAuthHandler -> req.isAuthenticated", req['isAuthenticated']);

    //   console.log("🚀 QuyNH: apiAuthHandler -> { baseUrl, originalUrl, path, params, query, secret }", { baseUrl, originalUrl, path, params, query, secret });
    // }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      originUrl: path,
      redirectUrl: redirectUrl,
    });
  }
};

/**
 * Middleware to protect web app routes
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {Promise<void>}
 */
const webAuthHandler = async (req, res, next) => {
  const { baseUrl, originalUrl, path, params, query, secret } = req || {};
  const errorRef = {};

  try {
    if (!(await isAuthenticated(req, errorRef))) {
      const loginUrl = '/login?redirectUrl=' + encodeURIComponent(originalUrl)
        + '&errorMessage=' + encodeURIComponent(errorRef.message || 'No authentication token, access denied');
      return res.redirect(loginUrl);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log("🚀 QuyNH: apiAuthHandler -> errorRef", errorRef);
      console.log("🚀 QuyNH: apiAuthHandler -> req.userId", req['userId']);
      console.log("🚀 QuyNH: apiAuthHandler -> req.isAuthenticated", req['isAuthenticated']);

      console.log("🚀 QuyNH: apiAuthHandler -> { baseUrl, originalUrl, path, params, query, secret }", { baseUrl, originalUrl, path, params, query, secret });
    }

    next();
  } catch (error) {
    const message = 'Server error during authentication';
    const loginUrl = '/login?redirectUrl=' + encodeURIComponent(originalUrl) + '&errorMessage=' + encodeURIComponent(message);

    return res.status(500).redirect(loginUrl);
  }
};

module.exports = {
  apiAuthHandler,
  webAuthHandler,
};
