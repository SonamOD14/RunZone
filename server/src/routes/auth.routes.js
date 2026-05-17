const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth');

// Public routes - no token needed
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);

// Protected route - token required
router.get('/me', verifyToken, AuthController.getMe);

module.exports = router;