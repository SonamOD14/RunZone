const RunModel = require('../models/run.model');
const TileService = require('../services/tileService');

const RunsController = {
  // POST /api/runs/start
  async startRun(req, res, next) {
    try {
      const user_id = req.user.id;

      // Create a new run session
      const run = await RunModel.create(user_id);

      res.status(201).json({
        message: 'Run started.',
        run
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/runs/end
  async endRun(req, res, next) {
    try {
      const user_id = req.user.id;
      const { run_id, distance_meters, duration_seconds, coordinates } = req.body;

      // Validate required fields
      if (!run_id || !coordinates || !Array.isArray(coordinates)) {
        return res.status(400).json({ error: 'run_id and coordinates are required.' });
      }

      // Process coordinates into tiles and capture them
      const tilesResult = await TileService.processTiles({
        coordinates,
        user_id,
        run_id
      });

      // End the run and save stats
      const run = await RunModel.endRun({
        run_id,
        distance_meters: distance_meters || 0,
        duration_seconds: duration_seconds || 0,
        tiles_captured: tilesResult.newTilesCaptured
      });

      res.status(200).json({
        message: 'Run ended successfully.',
        run,
        tiles_captured: tilesResult.newTilesCaptured,
        tiles_contested: tilesResult.tilesContested
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/runs/history
  async getHistory(req, res, next) {
    try {
      const user_id = req.user.id;
      const runs = await RunModel.findByUser(user_id);

      res.status(200).json({ runs });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/runs/stats
  async getStats(req, res, next) {
    try {
      const user_id = req.user.id;
      const totalDistance = await RunModel.getTotalDistance(user_id);
      const runs = await RunModel.findByUser(user_id);

      res.status(200).json({
        total_runs: runs.length,
        total_distance_meters: totalDistance,
        total_distance_km: (totalDistance / 1000).toFixed(2)
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = RunsController;