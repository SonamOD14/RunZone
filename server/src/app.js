const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const runsRoutes = require('./routes/runs.routes');
const territoryRoutes = require('./routes/territory.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const profileRoutes = require('./routes/profile.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/runs', runsRoutes);
app.use('/api/territory', territoryRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'RunZone API is running' });
});

// Error handler (always last)
app.use(errorHandler);

module.exports = app;