import axios from 'axios'

// ─── Helpers ──────────────────────────────────────────────
export function getCookie(name: string): string {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift() ?? ''
  return ''
}

function getCSRFToken(): string {
  // Try meta tag first (from react_base.html)
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
  if (meta?.content) return meta.content
  // Fallback to cookie
  return getCookie('csrftoken')
}

// ─── Axios Instance ───────────────────────────────────────
const api = axios.create({
  baseURL: '',           // All calls are relative — Django handles routing
  withCredentials: true, // Send session cookies
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── Request Interceptor — Attach CSRF ───────────────────
api.interceptors.request.use((config) => {
  const method = (config.method ?? '').toLowerCase()
  if (!['get', 'head', 'options'].includes(method)) {
    const token = getCSRFToken()
    if (token) config.headers['X-CSRFToken'] = token
  }
  return config
})

// ─── Response Interceptor — Handle Errors ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return rejected promise so calling component/context can handle state
    return Promise.reject(error)
  }
)


export { api }
export default api
