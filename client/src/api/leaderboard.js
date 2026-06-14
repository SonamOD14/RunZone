import axios from 'axios'
import { API_BASE_URL } from './config'

const API = axios.create({
  baseURL: API_BASE_URL
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getLeaderboard = () => API.get('/leaderboard')
export const getMyRank = () => API.get('/leaderboard/me')