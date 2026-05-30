import axios from 'axios'

const apiBaseURL = (import.meta.env.VITE_API_URL?.trim() || '').replace(/\/$/, '')

if (!apiBaseURL) {
  console.error(
    '[DistillERP] VITE_API_URL is not configured.\n' +
    'Go to Vercel → Project → Settings → Environment Variables\n' +
    'and add: VITE_API_URL = https://distillerp-0v1w.onrender.com\n' +
    'Then redeploy.'
  )
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`
  }
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
