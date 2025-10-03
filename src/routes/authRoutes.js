const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { userValidation } = require('../middleware/validator');

// Public routes
router.post('/register', userValidation.register, authController.register);
router.post('/login', userValidation.login, authController.login);

// Private routes
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;
