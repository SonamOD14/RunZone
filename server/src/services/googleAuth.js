const axios = require('axios');
require('dotenv').config();

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

const GoogleAuthService = {
  getAuthURL() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: `${process.env.SERVER_URL}/api/auth/google/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: SCOPES,
    };

    const params = new URLSearchParams(options);
    return `${rootUrl}?${params.toString()}`;
  },

  async getGoogleUser(code) {
    const { data: tokens } = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.SERVER_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    });

    const { data: googleUser } = await axios.get(GOOGLE_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    return googleUser;
  },
};

module.exports = GoogleAuthService;
