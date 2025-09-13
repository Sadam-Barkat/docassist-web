import { apiCache } from './cache'

// API Configuration  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

// Simple fetch-based API client to avoid CORS preflight issues
const apiClient = {
  async get(url: string, options: any = {}) {
    // Check cache first for GET requests (unless explicitly disabled)
    const cacheKey = `GET:${url}`
    const useCache = options.cache !== false
    
    if (useCache) {
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return cached
      }
    }
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const headers: any = {
      'Accept': 'application/json',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: { ...headers, ...options.headers },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const result = { data: await response.json(), status: response.status }
    
    // Cache successful GET requests for 3 minutes
    if (useCache && response.status === 200) {
      apiCache.set(cacheKey, result, 3)
    }
    
    return result
  },

  async post(url: string, data: any = {}, options: any = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(data),
      ...options
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
      error.response = { data: errorData, status: response.status }
      throw error
    }
    
    const result = { data: await response.json(), status: response.status }
    
    // Clear related cache entries after POST operations
    if (response.status >= 200 && response.status < 300) {
      // Clear cache for common endpoints that might be affected
      apiCache.delete('GET:/doctors')
      apiCache.delete('GET:/appointments')
      apiCache.delete('GET:/users/me')
    }
    
    return result
  },

  async put(url: string, data: any = {}, options: any = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(data),
      ...options
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
      error.response = { data: errorData, status: response.status }
      throw error
    }
    
    return { data: await response.json(), status: response.status }
  },

  async delete(url: string, options: any = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const headers: any = {
      'Accept': 'application/json',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: { ...headers, ...options.headers },
      ...options
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
      error.response = { data: errorData, status: response.status }
      throw error
    }
    
    return { data: await response.json(), status: response.status }
  }
}

// Helper function to handle API responses
export const handleApiResponse = <T>(response: any): { success: boolean; data?: T; error?: string } => {
  if (response.status >= 200 && response.status < 300) {
    return { success: true, data: response.data }
  }
  return { success: false, error: 'Request failed' }
}

// Helper function to handle API errors
export const handleApiError = (error: any): { success: false; error: string } => {
  if (error.response?.data?.detail) {
    // FastAPI validation error format
    if (Array.isArray(error.response.data.detail)) {
      const messages = error.response.data.detail.map((err: any) => err.msg || err.message).join(', ')
      return { success: false, error: messages }
    }
    return { success: false, error: error.response.data.detail }
  }
  
  if (error.response?.data?.message) {
    return { success: false, error: error.response.data.message }
  }
  
  if (error.message) {
    return { success: false, error: error.message }
  }
  
  return { success: false, error: 'An unexpected error occurred' }
}

// Handle 401 errors globally
const handle401Error = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.location.href = '/login'
  }
}

// Wrap API client methods to handle 401 errors
const wrappedApiClient = {
  async get(url: string, options: any = {}) {
    try {
      return await apiClient.get(url, options)
    } catch (error: any) {
      if (error.response?.status === 401) {
        handle401Error()
      }
      throw error
    }
  },
  
  async post(url: string, data: any = {}, options: any = {}) {
    try {
      return await apiClient.post(url, data, options)
    } catch (error: any) {
      if (error.response?.status === 401) {
        handle401Error()
      }
      throw error
    }
  },
  
  async put(url: string, data: any = {}, options: any = {}) {
    try {
      return await apiClient.put(url, data, options)
    } catch (error: any) {
      if (error.response?.status === 401) {
        handle401Error()
      }
      throw error
    }
  },
  
  async delete(url: string, options: any = {}) {
    try {
      return await apiClient.delete(url, options)
    } catch (error: any) {
      if (error.response?.status === 401) {
        handle401Error()
      }
      throw error
    }
  }
}

export default wrappedApiClient
