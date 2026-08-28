const express = require('express');
const router = express.Router();
const TerritoryController = require('../controllers/territory.controller');
const verifyToken = require('../middleware/auth');

// Public route - anyone can see the territory map
router.get('/all', TerritoryController.getAllTiles);

// Protected routes - must be logged in
router.get('/mine', verifyToken, TerritoryController.getMyTiles);
router.get('/history', verifyToken, TerritoryController.getMyHistory);
router.get('/user/:id', verifyToken, TerritoryController.getUserTiles);
router.get('/tile', verifyToken, TerritoryController.getTileInfo);
router.delete('/abandon', verifyToken, TerritoryController.abandonTile);

module.exports = router;
