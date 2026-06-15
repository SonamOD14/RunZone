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

export const getAllTiles = () => API.get('/territory/all')
export const getMyTiles = () => API.get('/territory/mine')
export const getUserTiles = (id) => API.get(`/territory/user/${id}`)
export const getTileInfo = (tile_x, tile_y, zoom) =>
  API.get(`/territory/tile?tile_x=${tile_x}&tile_y=${tile_y}&zoom=${zoom}`)