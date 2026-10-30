const pool = require('../config/db');

// How many days before tiles start decaying
const DECAY_AFTER_DAYS = 7;

const DecayService = {
  // Remove tiles from users who have been inactive
  // This runs on a schedule to keep the game competitive
  async applyDecay() {
    try {
      console.log('🕐 Running territory decay check...');

      // Find all tiles where the owner has been inactive
      // for more than DECAY_AFTER_DAYS days
      const result = await pool.query(
        `UPDATE tiles
         SET owner_id = NULL
         WHERE owner_id IN (
           SELECT id FROM users
           WHERE last_active < NOW() - INTERVAL '${DECAY_AFTER_DAYS} days'
         )
         RETURNING tile_x, tile_y`
      );

      const decayedCount = result.rowCount;
      console.log(`✅ Decay applied: ${decayedCount} tiles released`);

      return { decayedCount };
    } catch (err) {
      console.error('❌ Decay service error:', err.message);
    }
  },

  // Start decay on a schedule
  // Runs every 24 hours automatically
  startDecaySchedule() {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    console.log('⏰ Decay schedule started - runs every 24 hours');

    // Run once immediately when server starts
    this.applyDecay();

    // Then run every 24 hours
    setInterval(() => {
      this.applyDecay();
    }, TWENTY_FOUR_HOURS);
  }
};

module.exports = DecayService;