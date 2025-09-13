// Authentication utilities
import type { User } from "./types"

export interface AuthState {
  user: Omit<User, "password"> | null
  token: string | null
  isAuthenticated: boolean
}

export const getAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false }
  }

  const token = localStorage.getItem("auth_token")
  const userStr = localStorage.getItem("auth_user")

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      return { user, token, isAuthenticated: true }
    } catch {
      // Clear invalid data
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
    }
  }

  return { user: null, token: null, isAuthenticated: false }
}

export const setAuthState = (user: Omit<User, "password">, token: string): void => {
  localStorage.setItem("auth_token", token)
  localStorage.setItem("auth_user", JSON.stringify(user))
}

export const clearAuthState = (): void => {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("auth_user")
}

export const isAdmin = (user: Omit<User, "password"> | null): boolean => {
  return user?.role === "admin"
}
