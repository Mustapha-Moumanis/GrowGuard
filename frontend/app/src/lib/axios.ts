// import axios from "axios"
// import { toast } from "sonner"

// // Create axios instance with base configuration
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("GrowGuard-access-token")
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// // Response interceptor to handle token expiration and refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true

//       try {
//         const refreshToken = localStorage.getItem("GrowGuard-refresh-token")
//         if (!refreshToken) {
//           throw new Error("No refresh token available")
//         }

//         // Try to refresh token using dj-rest-auth endpoint
//         const refreshResponse = await axios.post(
//           `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/token/refresh/`,
//           { refresh: refreshToken },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           },
//         )

//         const { access } = refreshResponse.data

//         // Store new access token
//         localStorage.setItem("GrowGuard-access-token", access)

//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${access}`
//         return api(originalRequest)
//       } catch (refreshError: any) {
//         // Refresh failed, clear tokens and redirect to login
//         localStorage.removeItem("GrowGuard-access-token")
//         localStorage.removeItem("GrowGuard-refresh-token")
//         localStorage.removeItem("GrowGuard-user")

//         // Handle different refresh error scenarios
//         if (refreshError.response?.status === 401) {
//           toast.error("Session expired", {
//             description: "Please sign in again.",
//           })
//         } else {
//           toast.error("Authentication error", {
//             description: "Please sign in again.",
//           })
//         }

//         // Redirect to login page
//         window.location.href = "/login"
//         return Promise.reject(refreshError)
//       }
//     }

//     return Promise.reject(error)
//   },
// )

// export default api



import axios from "axios"
import { toast } from "sonner"

console.log(import.meta.env.VITE_API_URL, import.meta.env.BASE_URL)

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("GrowGuard-access-token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("GrowGuard-refresh-token")
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }

        // Try to refresh token using dj-rest-auth endpoint
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/token/refresh/`,
          { refresh: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        const { access } = refreshResponse.data

        // Store new access token
        localStorage.setItem("GrowGuard-access-token", access)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError: any) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("GrowGuard-access-token")
        localStorage.removeItem("GrowGuard-refresh-token")
        localStorage.removeItem("GrowGuard-user")

        // Handle different refresh error scenarios
        if (refreshError.response?.status === 401) {
          toast.error("Session expired", {
            description: "Please sign in again.",
          })
        } else {
          toast.error("Authentication error", {
            description: "Please sign in again.",
          })
        }

        // Redirect to login page
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
