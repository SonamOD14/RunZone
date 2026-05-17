const TileModel = require('../models/tile.model');

const TerritoryController = {
  // GET /api/territory/all
  // Returns all tiles for the map view
  async getAllTiles(req, res, next) {
    try {
      const tiles = await TileModel.getAllTiles();
      res.status(200).json({ tiles });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/territory/mine
  // Returns tiles owned by logged in user
  async getMyTiles(req, res, next) {
    try {
      const user_id = req.user.id;
      const tiles = await TileModel.findByOwner(user_id);
      const total = await TileModel.countByOwner(user_id);

      res.status(200).json({
        total_tiles: total,
        tiles
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/territory/user/:id
  // Returns tiles owned by any user
  async getUserTiles(req, res, next) {
    try {
      const owner_id = req.params.id;
      const tiles = await TileModel.findByOwner(owner_id);
      const total = await TileModel.countByOwner(owner_id);

      res.status(200).json({
        total_tiles: total,
        tiles
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/territory/tile
  // Returns info about a specific tile
  async getTileInfo(req, res, next) {
    try {
      const { tile_x, tile_y, zoom } = req.query;

      if (!tile_x || !tile_y || !zoom) {
        return res.status(400).json({ error: 'tile_x, tile_y and zoom are required.' });
      }

      const tile = await TileModel.findByCoords({
        tile_x: parseInt(tile_x),
        tile_y: parseInt(tile_y),
        zoom: parseInt(zoom)
      });

      if (!tile) {
        return res.status(404).json({ error: 'Tile not found.' });
      }

      res.status(200).json({ tile });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TerritoryController;