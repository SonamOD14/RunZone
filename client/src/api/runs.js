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

export const startRun = () => API.post('/runs/start')
export const endRun = (data) => API.post('/runs/end', data)
export const getRunHistory = () => API.get('/runs/history')
export const getRunStats = () => API.get('/runs/stats')