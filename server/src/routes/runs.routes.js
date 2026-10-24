const express = require('express');
const router = express.Router();
const RunsController = require('../controllers/runs.controller');
const verifyToken = require('../middleware/auth');

// All run routes are protected - user must be logged in
router.post('/start', verifyToken, RunsController.startRun);
router.post('/end', verifyToken, RunsController.endRun);
router.get('/history', verifyToken, RunsController.getHistory);
router.get('/stats', verifyToken, RunsController.getStats);

module.exports = router;