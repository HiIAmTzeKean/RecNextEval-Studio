const API_BASE = import.meta.env.VITE_BACKEND_BASE_URL;

export const apiFetch = (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${API_BASE}${endpoint}`
  const token = typeof window !== 'undefined' ? localStorage.getItem('recnexteval_access_token') : null
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(url, { ...options, headers })
}

export const buildUrl = (endpoint: string): string => {
  return `${API_BASE}${endpoint}`
}