import axios from 'axios'

const API = axios.create({
  baseURL: '/api'
})

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Leaderboard API calls
export const getLeaderboard = () => API.get('/leaderboard')
export const getMyRank = () => API.get('/leaderboard/me')