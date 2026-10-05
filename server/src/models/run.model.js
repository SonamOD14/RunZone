const pool = require('../config/db');

const RunModel = {
  // Start a new run session
  async create(user_id) {
    const result = await pool.query(
      `INSERT INTO runs (user_id)
       VALUES ($1)
       RETURNING *`,
      [user_id]
    );
    return result.rows[0];
  },

  // End a run session and save stats
  async endRun({ run_id, distance_meters, duration_seconds, tiles_captured }) {
    const result = await pool.query(
      `UPDATE runs
       SET ended_at = NOW(),
           distance_meters = $1,
           duration_seconds = $2,
           tiles_captured = $3
       WHERE id = $4
       RETURNING *`,
      [distance_meters, duration_seconds, tiles_captured, run_id]
    );
    return result.rows[0];
  },

  // Get all runs for a user
  async findByUser(user_id) {
    const result = await pool.query(
      `SELECT * FROM runs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  // Get a single run by id
  async findById(run_id) {
    const result = await pool.query(
      `SELECT * FROM runs WHERE id = $1`,
      [run_id]
    );
    return result.rows[0];
  },

  // Get total distance for a user
  async getTotalDistance(user_id) {
    const result = await pool.query(
      `SELECT COALESCE(SUM(distance_meters), 0) AS total_distance
       FROM runs
       WHERE user_id = $1 AND ended_at IS NOT NULL`,
      [user_id]
    );
    return result.rows[0].total_distance;
  }
};

module.exports = RunModel;