import axios from 'axios'

const apiBaseURL = (import.meta.env.VITE_API_URL?.trim() || '').replace(/\/$/, '')

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
  // 60 s — accommodates Render free-tier cold starts (service sleeps after 15 min idle)
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?._retry) {
      error.config._retry = true
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
