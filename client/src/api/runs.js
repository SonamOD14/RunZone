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

// Runs API calls
export const startRun = () => API.post('/runs/start')
export const endRun = (data) => API.post('/runs/end', data)
export const getRunHistory = () => API.get('/runs/history')
export const getRunStats = () => API.get('/runs/stats')
