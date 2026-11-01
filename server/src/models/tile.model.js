const pool = require('../config/db');

const TileModel = {
  // Capture or update a tile owner
  async captureTitle({ tile_x, tile_y, zoom, owner_id }) {
    const result = await pool.query(
      `INSERT INTO tiles (tile_x, tile_y, zoom, owner_id, captured_at, last_visited)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (tile_x, tile_y, zoom)
       DO UPDATE SET
         owner_id = $4,
         captured_at = NOW(),
         last_visited = NOW()
       RETURNING *`,
      [tile_x, tile_y, zoom, owner_id]
    );
    return result.rows[0];
  },

  // Log tile capture history
  async logHistory({ tile_x, tile_y, zoom, captured_by, run_id }) {
    const result = await pool.query(
      `INSERT INTO tile_history (tile_x, tile_y, zoom, captured_by, run_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tile_x, tile_y, zoom, captured_by, run_id]
    );
    return result.rows[0];
  },

  // Get all tiles owned by a user
  async findByOwner(owner_id) {
    const result = await pool.query(
      `SELECT * FROM tiles WHERE owner_id = $1`,
      [owner_id]
    );
    return result.rows;
  },

  // Get total tile count for a user
  async countByOwner(owner_id) {
    const result = await pool.query(
      `SELECT COUNT(*) AS total_tiles
       FROM tiles WHERE owner_id = $1`,
      [owner_id]
    );
    return parseInt(result.rows[0].total_tiles);
  },

  // Get all tiles (for territory map view)
  async getAllTiles() {
    const result = await pool.query(
      `SELECT t.tile_x, t.tile_y, t.zoom, t.owner_id, u.username
       FROM tiles t
       LEFT JOIN users u ON t.owner_id = u.id`
    );
    return result.rows;
  },

  // Get a single tile by coordinates
  async findByCoords({ tile_x, tile_y, zoom }) {
    const result = await pool.query(
      `SELECT t.*, u.username
       FROM tiles t
       LEFT JOIN users u ON t.owner_id = u.id
       WHERE t.tile_x = $1 AND t.tile_y = $2 AND t.zoom = $3`,
      [tile_x, tile_y, zoom]
    );
    return result.rows[0];
  },

  // Get capture history for a specific tile
  async getHistoryByTile({ tile_x, tile_y, zoom }) {
    const result = await pool.query(
      `SELECT th.*, u.username
       FROM tile_history th
       LEFT JOIN users u ON th.captured_by = u.id
       WHERE th.tile_x = $1 AND th.tile_y = $2 AND th.zoom = $3
       ORDER BY th.captured_at DESC
       LIMIT 20`,
      [tile_x, tile_y, zoom]
    );
    return result.rows;
  },

  // Get capture history for a user
  async getHistoryByUser(user_id) {
    const result = await pool.query(
      `SELECT th.*, u.username
       FROM tile_history th
       LEFT JOIN users u ON th.captured_by = u.id
       WHERE th.captured_by = $1
       ORDER BY th.captured_at DESC
       LIMIT 50`,
      [user_id]
    );
    return result.rows;
  },

  // Abandon (release) a tile
  async abandonTile({ tile_x, tile_y, zoom, owner_id }) {
    const result = await pool.query(
      `UPDATE tiles
       SET owner_id = NULL, last_visited = NOW()
       WHERE tile_x = $1 AND tile_y = $2 AND zoom = $3 AND owner_id = $4
       RETURNING *`,
      [tile_x, tile_y, zoom, owner_id]
    );
    return result.rows[0];
  },

  // Get territory summary stats
  async getStats() {
    const result = await pool.query(
      `SELECT
         COUNT(*) AS total_tiles,
         COUNT(DISTINCT owner_id) FILTER (WHERE owner_id IS NOT NULL) AS occupied_tiles,
         COUNT(*) FILTER (WHERE owner_id IS NULL) AS unclaimed_tiles,
         COUNT(DISTINCT owner_id) AS total_owners
       FROM tiles`
    );
    return result.rows[0];
  }
};

module.exports = TileModel;