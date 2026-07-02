import axios from 'axios'

// In production: VITE_API_URL=https://your-backend.vercel.app/api/v1
// In local dev:  falls back to /api/v1 (proxied by Vite to localhost:5000)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // needed for httpOnly refresh-token cookie
})

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnflow_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401 — try /auth/refresh before logging out
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If not 401, or already retried, or it's the refresh call itself — reject
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Try to get new access token using httpOnly refresh cookie
      const { data } = await api.post('/auth/refresh')
      const newToken = data.data?.accessToken
      if (!newToken) throw new Error('No token in refresh response')

      localStorage.setItem('learnflow_access_token', newToken)
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      processQueue(null, newToken)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('learnflow_access_token')
      localStorage.removeItem('learnflow_auth')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
