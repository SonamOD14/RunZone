const pool = require('../config/db');

const LeaderboardController = {
  // GET /api/leaderboard
  // Returns top runners ranked by territory, distance and captures
  async getLeaderboard(req, res, next) {
    try {
      const result = await pool.query(
        `SELECT
          u.id,
          u.username,
          u.last_active,
          COUNT(DISTINCT t.id) AS total_tiles,
          COALESCE(SUM(r.distance_meters), 0) AS total_distance,
          COALESCE(SUM(r.tiles_captured), 0) AS total_captures
         FROM users u
         LEFT JOIN tiles t ON t.owner_id = u.id
         LEFT JOIN runs r ON r.user_id = u.id AND r.ended_at IS NOT NULL
         GROUP BY u.id, u.username, u.last_active
         ORDER BY total_tiles DESC, total_distance DESC
         LIMIT 50`
      );

      // Add rank number to each user
      const leaderboard = result.rows.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        username: user.username,
        total_tiles: parseInt(user.total_tiles),
        total_distance_km: (user.total_distance / 1000).toFixed(2),
        total_captures: parseInt(user.total_captures),
        last_active: user.last_active
      }));

      res.status(200).json({ leaderboard });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/leaderboard/me
  // Returns logged in user's rank
  async getMyRank(req, res, next) {
    try {
      const user_id = req.user.id;

      const result = await pool.query(
        `SELECT rank FROM (
          SELECT
            u.id,
            RANK() OVER (ORDER BY COUNT(DISTINCT t.id) DESC) AS rank
          FROM users u
          LEFT JOIN tiles t ON t.owner_id = u.id
          GROUP BY u.id
        ) ranked
        WHERE id = $1`,
        [user_id]
      );

      const rank = result.rows[0]?.rank || null;

      res.status(200).json({ rank });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = LeaderboardController;