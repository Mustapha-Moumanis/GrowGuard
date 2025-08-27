"use client"

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react"
import { authApi, ApiError } from "@/lib/api"
import { toast } from "sonner"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<any>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  isLoading: boolean
  isAuthenticated: boolean
  checkAuth: () => Promise<boolean>
  shouldShowLocationSetup: boolean
  setShouldShowLocationSetup: (show: boolean) => void
}

interface RegisterData {
  username: string
  email: string
  password1: string
  password2: string
  role: "Farmer" | "Agronomist"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [shouldShowLocationSetup, setShouldShowLocationSetup] = useState(false)

  // Check if user needs location setup
  const needsLocationSetup = (userData: User): boolean => {
    return !userData.country || !userData.region || !userData.city
  }

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const isAuth = await authApi.checkAuthStatus()
      if (isAuth) {
        const userData = await authApi.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)

        // Check if location setup is needed
        if (needsLocationSetup(userData)) {
          setShouldShowLocationSetup(true)
        }
        return true
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setShouldShowLocationSetup(false)
        return false
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      setIsAuthenticated(false)
      setShouldShowLocationSetup(false)
      return false
    }
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      await checkAuth()
      setIsLoading(false)
    }

    initializeAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)

      // Store tokens (dj-rest-auth typically returns access and refresh tokens)
      if (response.access_token || response.access) {
        localStorage.setItem("GrowGuard-access-token", response.access_token || response.access)
      }
      if (response.refresh_token || response.refresh) {
        localStorage.setItem("GrowGuard-refresh-token", response.refresh_token || response.refresh)
      }

      // Set user data
      const userData = response.user || response
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem("GrowGuard-user", JSON.stringify(userData))

      // Check if location setup is needed
      if (needsLocationSetup(userData)) {
        setShouldShowLocationSetup(true)
      }
      toast.success("Welcome back!", {
        description: "You have successfully signed in to GrowGuard.",
      })
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error("Login failed. Please try again.")
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await authApi.register(userData)
      return response
    } catch (error) {
      console.log("Registration error:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error("Registration failed. Please try again.")
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear all auth data
      setUser(null)
      setIsAuthenticated(false)
      setShouldShowLocationSetup(false)
      localStorage.removeItem("GrowGuard-access-token")
      localStorage.removeItem("GrowGuard-refresh-token")
      localStorage.removeItem("GrowGuard-user")
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("GrowGuard-user", JSON.stringify(updatedUser))

      // Check if location setup is still needed
      if (!needsLocationSetup(updatedUser)) {
        setShouldShowLocationSetup(false)
      }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
    isAuthenticated,
    checkAuth,
    shouldShowLocationSetup,
    setShouldShowLocationSetup,
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
