-- ================================
-- RUNZONE DATABASE SCHEMA
-- ================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- Runs table (each running session)
CREATE TABLE IF NOT EXISTS runs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  distance_meters FLOAT DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  tiles_captured INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tiles table (territory grid)
CREATE TABLE IF NOT EXISTS tiles (
  id SERIAL PRIMARY KEY,
  tile_x INTEGER NOT NULL,
  tile_y INTEGER NOT NULL,
  zoom INTEGER NOT NULL DEFAULT 15,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  captured_at TIMESTAMP DEFAULT NOW(),
  last_visited TIMESTAMP DEFAULT NOW(),
  UNIQUE(tile_x, tile_y, zoom)
);

-- Tile capture history
CREATE TABLE IF NOT EXISTS tile_history (
  id SERIAL PRIMARY KEY,
  tile_x INTEGER NOT NULL,
  tile_y INTEGER NOT NULL,
  zoom INTEGER NOT NULL DEFAULT 15,
  captured_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  run_id INTEGER REFERENCES runs(id) ON DELETE CASCADE,
  captured_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_tiles_owner ON tiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_tiles_coords ON tiles(tile_x, tile_y, zoom);
CREATE INDEX IF NOT EXISTS idx_runs_user ON runs(user_id);
CREATE INDEX IF NOT EXISTS idx_tile_history_user ON tile_history(captured_by);