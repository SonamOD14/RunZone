const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profile.controller');
const verifyToken = require('../middleware/auth');

// Protected route - get your own profile
router.get('/', verifyToken, ProfileController.getProfile);

// Protected route - update your profile
router.put('/', verifyToken, ProfileController.updateProfile);

// Public route - view anyone's public profile
router.get('/:username', ProfileController.getPublicProfile);

module.exports = router;