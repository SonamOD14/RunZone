const UserModel = require('../models/user.model');
const RunModel = require('../models/run.model');
const TileModel = require('../models/tile.model');

const ProfileController = {
  // GET /api/profile
  // Returns logged in user's full profile and stats
  async getProfile(req, res, next) {
    try {
      const user_id = req.user.id;

      // Get user info
      const user = await UserModel.findById(user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Get run stats
      const totalDistance = await RunModel.getTotalDistance(user_id);
      const runs = await RunModel.findByUser(user_id);

      // Get territory stats
      const totalTiles = await TileModel.countByOwner(user_id);

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
          last_active: user.last_active
        },
        stats: {
          total_runs: runs.length,
          total_distance_meters: totalDistance,
          total_distance_km: (totalDistance / 1000).toFixed(2),
          total_tiles_owned: totalTiles
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/profile/:username
  // Returns any user's public profile
  async getPublicProfile(req, res, next) {
    try {
      const { username } = req.params;

      // Find user by username
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Get their stats
      const totalDistance = await RunModel.getTotalDistance(user.id);
      const runs = await RunModel.findByUser(user.id);
      const totalTiles = await TileModel.countByOwner(user.id);

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at,
          last_active: user.last_active
        },
        stats: {
          total_runs: runs.length,
          total_distance_km: (totalDistance / 1000).toFixed(2),
          total_tiles_owned: totalTiles
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/profile
  // Update username
  async updateProfile(req, res, next) {
    try {
      const user_id = req.user.id;
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
      }

      // Check if username is taken
      const existing = await UserModel.findByUsername(username);
      if (existing && existing.id !== user_id) {
        return res.status(400).json({ error: 'Username already taken.' });
      }

      const pool = require('../config/db');
      const result = await pool.query(
        `UPDATE users SET username = $1 WHERE id = $2
         RETURNING id, username, email`,
        [username, user_id]
      );

      res.status(200).json({
        message: 'Profile updated.',
        user: result.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ProfileController;
