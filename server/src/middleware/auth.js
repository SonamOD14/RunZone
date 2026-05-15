const jwt = require('jsonwebtoken');
require('dotenv').config();

// This function runs before any protected route
// It checks if the user has a valid JWT token
const verifyToken = (req, res, next) => {
  // Get token from request header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user data to request so routes can use it
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
