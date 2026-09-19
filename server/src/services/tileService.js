const TileModel = require('../models/tile.model');

// Zoom level 15 gives tiles roughly 1.2km x 0.8km
// Big enough to feel meaningful, small enough for competition
const ZOOM = 15;

const TileService = {
  // Convert GPS coordinate to tile x,y numbers
  coordToTile(lat, lng) {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, ZOOM));
    const y = Math.floor(
      (1 - Math.log(
        Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)
      ) / Math.PI) / 2 * Math.pow(2, ZOOM)
    );
    return { tile_x: x, tile_y: y, zoom: ZOOM };
  },

  // Remove duplicate tiles from an array
  // Running same path twice = same tiles = no extra credit
  getUniqueTiles(tiles) {
    const seen = new Set();
    return tiles.filter(tile => {
      const key = `${tile.tile_x}-${tile.tile_y}-${tile.zoom}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  // Main function - takes GPS coordinates from a run
  // Converts them to tiles and captures them for the user
  async processTiles({ coordinates, user_id, run_id }) {
    // Step 1: Convert all GPS points to tiles
    const allTiles = coordinates.map(coord =>
      this.coordToTile(coord.lat, coord.lng)
    );

    // Step 2: Remove duplicates
    const uniqueTiles = this.getUniqueTiles(allTiles);

    let newTilesCaptured = 0;
    let tilesContested = 0;

    // Step 3: For each unique tile, capture it
    for (const tile of uniqueTiles) {
      // Check if tile already exists and who owns it
      const existing = await TileModel.findByCoords(tile);

      if (!existing) {
        // Brand new tile - never captured before
        newTilesCaptured++;
      } else if (existing.owner_id !== user_id) {
        // Tile owned by someone else - contest it
        tilesContested++;
        newTilesCaptured++;
      }
      // If user already owns it - no change, no credit

      // Capture or update the tile ownership
      await TileModel.captureTitle({
        ...tile,
        owner_id: user_id
      });

      // Log the capture in history
      await TileModel.logHistory({
        ...tile,
        captured_by: user_id,
        run_id
      });
    }

    return {
      newTilesCaptured,
      tilesContested,
      totalProcessed: uniqueTiles.length
    };
  }
};

module.exports = TileService;