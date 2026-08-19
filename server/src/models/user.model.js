const pool = require('../config/db');

const UserModel = {
  // Create a new user
  async create({ username, email, password_hash }) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, password_hash]
    );
    return result.rows[0];
  },

  // Create a user from Google OAuth
  async createFromGoogle({ google_id, email, username, avatar_url }) {
    const result = await pool.query(
      `INSERT INTO users (google_id, email, username, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar_url, created_at`,
      [google_id, email, username, avatar_url]
    );
    return result.rows[0];
  },

  // Find user by email
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  },

  // Find user by Google ID
  async findByGoogleId(google_id) {
    const result = await pool.query(
      `SELECT * FROM users WHERE google_id = $1`,
      [google_id]
    );
    return result.rows[0];
  },

  // Find user by id
  async findById(id) {
    const result = await pool.query(
      `SELECT id, username, email, avatar_url, created_at, last_active
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Find user by username
  async findByUsername(username) {
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  },

  // Update last active timestamp
  async updateLastActive(id) {
    await pool.query(
      `UPDATE users SET last_active = NOW() WHERE id = $1`,
      [id]
    );
  },

  // Link Google account to existing user
  async linkGoogleAccount(userId, googleId) {
    const result = await pool.query(
      `UPDATE users SET google_id = $1 WHERE id = $2
       RETURNING id, username, email, avatar_url`,
      [googleId, userId]
    );
    return result.rows[0];
  }
};

module.exports = UserModel;