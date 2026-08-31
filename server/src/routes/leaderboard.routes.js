const express = require('express');
const router = express.Router();
const LeaderboardController = require('../controllers/leaderboard.controller');
const verifyToken = require('../middleware/auth');

// Public route - anyone can see the leaderboard
router.get('/', LeaderboardController.getLeaderboard);

// Protected route - get your own rank
router.get('/me', verifyToken, LeaderboardController.getMyRank);

module.exports = router;