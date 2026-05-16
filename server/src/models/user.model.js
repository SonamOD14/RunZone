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

  // Find user by email
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  },

  // Find user by id
  async findById(id) {
    const result = await pool.query(
      `SELECT id, username, email, created_at, last_active
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
  }
};

module.exports = UserModel;