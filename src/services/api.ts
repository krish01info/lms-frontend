import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('learnflow_auth')
  if (auth) {
    const user = JSON.parse(auth)
    config.headers.Authorization = `Bearer mock-token-${user.id}`
  }
  return config
})

export default api
