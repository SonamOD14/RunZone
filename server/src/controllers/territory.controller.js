const TileModel = require('../models/tile.model');

const TerritoryController = {
  // GET /api/territory/all
  async getAllTiles(req, res, next) {
    try {
      const tiles = await TileModel.getAllTiles();
      const stats = await TileModel.getStats();
      res.status(200).json({ tiles, stats });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/territory/mine
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

      const history = await TileModel.getHistoryByTile({
        tile_x: parseInt(tile_x),
        tile_y: parseInt(tile_y),
        zoom: parseInt(zoom)
      });

      res.status(200).json({ tile, history });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/territory/history
  async getMyHistory(req, res, next) {
    try {
      const history = await TileModel.getHistoryByUser(req.user.id);
      res.status(200).json({ history });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/territory/abandon
  async abandonTile(req, res, next) {
    try {
      const { tile_x, tile_y, zoom } = req.body;

      if (tile_x === undefined || tile_y === undefined || !zoom) {
        return res.status(400).json({ error: 'tile_x, tile_y and zoom are required.' });
      }

      const released = await TileModel.abandonTile({
        tile_x,
        tile_y,
        zoom,
        owner_id: req.user.id
      });

      if (!released) {
        return res.status(404).json({ error: 'Tile not found or not owned by you.' });
      }

      res.status(200).json({ message: 'Tile abandoned.', tile: released });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TerritoryController;
