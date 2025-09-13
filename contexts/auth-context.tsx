"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import { getAuthState, setAuthState, clearAuthState } from "@/lib/auth"

interface AuthContextType {
  user: Omit<User, "password"> | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    dateOfBirth: string
  }) => Promise<{ success: boolean; error?: string }>
  updateUser: (updatedUser: Omit<User, "password">) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state from localStorage
    const authState = getAuthState()
    setUser(authState.user)
    setToken(authState.token)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Import authApi dynamically to avoid SSR issues
      const { authApi } = await import("@/lib/api")
      const response = await authApi.login({ email, password })

      if (response.success && response.data) {
        setUser(response.data.user)
        setToken(response.data.token)
        setAuthState(response.data.user, response.data.token)
        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return { success: false, error: response.error || "Login failed" }
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Login error:', error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    dateOfBirth: string
  }) => {
    setIsLoading(true)
    try {
      const { authApi } = await import("@/lib/api")
      const response = await authApi.register(userData)

      if (response.success && response.data) {
        setUser(response.data.user)
        setToken(response.data.token)
        setAuthState(response.data.user, response.data.token)
        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return { success: false, error: response.error || "Registration failed" }
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Registration error:', error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const updateUser = (updatedUser: Omit<User, "password">) => {
    setUser(updatedUser)
    setAuthState(updatedUser, token || "")
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    clearAuthState()
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    updateUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
