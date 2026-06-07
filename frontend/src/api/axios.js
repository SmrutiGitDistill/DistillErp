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
  timeout: 90000, // 90 s — Render free tier cold starts can take up to 60 s
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const RETRY_LIMIT = 3
const RETRY_DELAY_MS = 5000 // 5 s between retries during cold start

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {}

    // Network error (no response at all) = cold start / socket drop → retry
    if (!error.response) {
      config._retries = (config._retries || 0) + 1

      if (config._retries <= RETRY_LIMIT) {
        console.warn(
          `[DistillERP] Network error — server may be waking up. ` +
          `Retrying (${config._retries}/${RETRY_LIMIT}) in ${RETRY_DELAY_MS / 1000}s...`
        )
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        return api(config)
      }
    }

    // Session expired (skip for login requests to allow displaying validation errors)
    if (error.response?.status === 401 && !config._retry && !config.url?.includes('/auth/login')) {
      config._retry = true
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
