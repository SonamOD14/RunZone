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

// Territory API calls
export const getAllTiles = () => API.get('/territory/all')
export const getMyTiles = () => API.get('/territory/mine')
export const getUserTiles = (id) => API.get(`/territory/user/${id}`)
export const getTileInfo = (tile_x, tile_y, zoom) =>
  API.get(`/territory/tile?tile_x=${tile_x}&tile_y=${tile_y}&zoom=${zoom}`)