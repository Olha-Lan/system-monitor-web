import axios from 'axios'

const API_URL = 'https://system-monitor-api-i6ku.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(username, password) {
    const res = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    return res.data
  },

  async register(username, email, password) {
    const res = await api.post('/auth/register', { username, email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    return res.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    window.location.href = '/'
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  },

  getUsername() {
    return localStorage.getItem('username') || ''
  }
}

export const metricsService = {
  async getMyMetrics(hours = 24) {
    const res = await api.get(`/metrics/my?hours=${hours}`)
    return res.data
  },

  async getCurrentMetrics() {
    const res = await api.get('/metrics/current')
    return res.data
  }
}

export default api