import api from "./axios"

import type { User } from "@/types"

export interface LocationData {
  farmLocation: string
  latitude: number
  longitude: number
}

export interface LocationResponse {
  hasLocation: boolean
  user?: User
}

class LocationService {
  async checkUserLocation(userId: string): Promise<LocationResponse> {
    try {
      const response = await api.get(`/users/${userId}/location/`)
      return response.data
    } catch (error: any) {
      console.error("Check location error:", error)
      throw this.handleError(error)
    }
  }

  async updateUserLocation(locationData: LocationData): Promise<User> {
    try {
      const response = await api.post("/users/location/", locationData)
      return response.data.user
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }

  async reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
    try {
      // Using a free geocoding service (you might want to use Google Maps API or similar)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      )

      if (!response.ok) {
        throw new Error("Geocoding failed")
      }

      const data = await response.json()

      if (data) {
        return {
          farmLocation: `
            ${data.city || data.town || data.village || ""}
            ${data.state || data.province || data.region || ""}
            ${data.country || ""}`
            .trim() || "Unknown location",
          latitude: lat,
          longitude: lng,
        }
      }

      return null
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return null
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data) {
      const { data } = error.response
      return new Error(data.message || data.detail || "Location service error")
    }

    if (error.request) {
      return new Error("Network error. Please check your connection.")
    }

    return new Error(error.message || "An unexpected error occurred")
  }
}

export const locationService = new LocationService()
