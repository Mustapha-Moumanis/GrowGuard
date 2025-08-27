import api from "./axios"
import type { User, Alert } from "@/types"

export class ApiError extends Error {
  public response?: any

  constructor(
    public status: number,
    message: string,
    response?: any,
  ) {
    super(message)
    this.name = "ApiError"
    this.response = response
  }
}

// Authentication API functions
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.message ||
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] || "Login failed",
        error.response,
      )
    }
  },

  register: async (userData: {
    username: string
    email: string
    password1: string
    password2: string
    role: "Farmer" | "Agronomist"
  }) => {
    try {
      const response = await api.post("/auth/registration/", userData)
      console.log("=> Registration error:", response)
      return response.data
    } catch (error: any) {
      console.log("=> Registration error:", import.meta.env.VITE_API_URL)
      const apiError = new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || "Registration failed",
        error.response,
      )
      throw apiError
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout/")
      return response.data
    } catch (error: any) {
      throw new ApiError(error.response?.status || 500, error.response?.data?.detail || "Logout failed", error.response)
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post("/auth/token/refresh/", {
        refresh: refreshToken,
      })
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Token refresh failed",
        error.response,
      )
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get("/auth/user/")
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to get user data",
        error.response,
      )
    }
  },

  verifyEmail: async (email: string, key: string) => {
    try {
      const response = await api.post("/auth/verify-email/", {
        email,
        key,
      })
      return response.data
    } catch (error: any) {
      console.log(error)
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Email verification failed",
        error.response
      )
    }
  },

  resendEmailVerification: async (email: string) => {
    try {
      const response = await api.post("/auth/registration/resend-email/", { email })
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to resend verification email",
        error.response,
      )
    }
  },

  checkAuthStatus: async (): Promise<boolean> => {
    try {
      const accessToken = localStorage.getItem("GrowGuard-access-token")
      const refreshToken = localStorage.getItem("GrowGuard-refresh-token")

      if (!accessToken && !refreshToken) {
        return false
      }

      // Try to get current user to verify token validity
      // await authApi.getCurrentUser()
      return true
    } catch (error) {
      // If getCurrentUser fails, try to refresh token
      const refreshToken = localStorage.getItem("GrowGuard-refresh-token")
      if (refreshToken) {
        try {
          await authApi.refreshToken(refreshToken)
          return true
        } catch (refreshError) {
          // Refresh failed, user is not authenticated
          localStorage.removeItem("GrowGuard-access-token")
          localStorage.removeItem("GrowGuard-refresh-token")
          localStorage.removeItem("GrowGuard-user")
          return false
        }
      }
      return false
    }
  },
}

export const alertsApi = {
  getAlerts: async (lat: number, lng: number, radius: number): Promise<Alert[]> => {
    try {
      const response = await api.get(`/alerts/?lat=${lat}&lng=${lng}&radius=${radius}`)
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to fetch alerts",
        error.response,
      )
    }
  },
  getMyAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await api.get(`/alerts/my-alerts`)
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to fetch alerts",
        error.response,
      )
    }
  },

  createAlert: async (alertData: any): Promise<Alert> => {
    try {
      const response = await api.post("/alerts/", alertData)
      return response.data
    } catch (error: any) {
      console.log(error)
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to create alert",
        error.response,
      )
    }
  },

  getAlert: async (alertId: string): Promise<Alert> => {
    try {
      const response = await api.get(`/alerts/${alertId}/`)
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to fetch alert",
        error.response,
      )
    }
  },

  updateAlert: async (alertId: string, alertData: any): Promise<Alert> => {
    try {
      const response = await api.put(`/alerts/${alertId}/`, alertData)
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to update alert",
        error.response,
      )
    }
  },

  deleteAlert: async (alertId: string): Promise<void> => {
    try {
      await api.delete(`/alerts/${alertId}/`)
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to delete alert",
        error.response,
      )
    }
  },

  bookmarkAlert: async (alertId: string): Promise<void> => {
    try {
      await api.post(`/alerts/${alertId}/bookmark/`)
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to bookmark alert",
        error.response,
      )
    }
  },

  unbookmarkAlert: async (alertId: string): Promise<void> => {
    try {
      await api.delete(`/alerts/${alertId}/bookmark/`)
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to remove bookmark",
        error.response,
      )
    }
  },

  reportAlert: async (alertId: string, reason: string): Promise<void> => {
    try {
      await api.post(`/alerts/${alertId}/report/`, { reason })
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to report alert",
        error.response,
      )
    }
  },

  getBookmarkedAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await api.get("/alerts/bookmarked/")
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to fetch bookmarked alerts",
        error.response,
      )
    }
  },

  getNearbyAlerts: async (lat: number, lng: number, radius: number): Promise<Alert[]> => {
    try {
      const response = await api.get("/alerts/nearby/", {
        params: { lat, lng, radius },
      })
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to fetch nearby alerts",
        error.response,
      )
    }
  },
}

export const userApi = {
  updateProfile: async (userData: Partial<User> | FormData  ) => {
    try {
      console.log("Updating profile with data:", userData)
      const response = await api.put("/auth/user", userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      })
      return response.data
    } catch (error: any) {
      console.error("Error updating profile:", error)
      throw new ApiError(error.response?.status || 500, error.response?.data?.message || "Failed to update profile")
    }
  },
  updateLocation: async (locationData: {
    country: string
    region: string
    city: string
    // location?: string
    latitude?: number
    longitude?: number
  }) => {
    try {
      const response = await api.put("/user/location/", locationData)
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to update location",
        error.response,
      )
    }
  },


  getUserStats: async (): Promise<any> => {
    try {
      const response = await api.get("/user/stats/")
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to fetch user stats",
        error.response,
      )
    }
  },

  updateNotificationPreferences: async (preferences: any) => {
    try {
      const response = await api.patch("/user/notifications/", preferences)
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to update notification preferences",
        error.response,
      )
    }
  },
}

// Notifications API
export const notificationsApi = {
  getNotifications: async (): Promise<any[]> => {
    try {
      const response = await api.get("/api/notifications/")
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to fetch notifications",
        error.response,
      )
    }
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await api.patch(`/api/notifications/${notificationId}/`, { isRead: true })
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to mark notification as read",
        error.response,
      )
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.post("/api/notifications/mark-all-read/")
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to mark all notifications as read",
        error.response,
      )
    }
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await api.delete(`/api/notifications/${notificationId}/`)
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.detail || "Failed to delete notification",
        error.response,
      )
    }
  },
}
