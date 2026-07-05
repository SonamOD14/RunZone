const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const GoogleAuthService = require('../services/googleAuth');
require('dotenv').config();

const AuthController = {
  // POST /api/auth/signup
  async signup(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // Check all fields are provided
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      // Check if email already exists
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use.' });
      }

      // Check if username already exists
      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken.' });
      }

      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create the user
      const user = await UserModel.create({ username, email, password_hash });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Account created successfully.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Check all fields are provided
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      // Compare password with stored hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      // Update last active
      await UserModel.updateLastActive(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/google - redirect to Google OAuth
  async googleAuth(req, res, next) {
    try {
      const url = GoogleAuthService.getAuthURL();
      res.redirect(url);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/google/callback - handle Google OAuth callback
  async googleCallback(req, res, next) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
      }

      const googleUser = await GoogleAuthService.getGoogleUser(code);

      // Check if user already exists with this Google ID
      let user = await UserModel.findByGoogleId(googleUser.id);

      if (user) {
        // Existing Google user - log them in
        await UserModel.updateLastActive(user.id);
      } else {
        // Check if email already exists (link Google account)
        const existingUser = await UserModel.findByEmail(googleUser.email);

        if (existingUser) {
          // Link Google account to existing user
          user = await UserModel.linkGoogleAccount(existingUser.id, googleUser.id);
        } else {
          // Create new user from Google profile
          const username = googleUser.name
            ? googleUser.name.replace(/\s+/g, '_').toLowerCase()
            : googleUser.email.split('@')[0];

          // Check if username is taken
          const existingUsername = await UserModel.findByUsername(username);
          const finalUsername = existingUsername
            ? `${username}_${Math.floor(Math.random() * 10000)}`
            : username;

          user = await UserModel.createFromGoogle({
            google_id: googleUser.id,
            email: googleUser.email,
            username: finalUsername,
            avatar_url: googleUser.picture || null,
          });
        }
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to client with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }
  },

  // GET /api/auth/me
  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;