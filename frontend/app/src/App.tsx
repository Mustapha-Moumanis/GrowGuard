"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { LoginForm } from "./components/auth/login-form"
import { RegisterForm } from "./components/auth/register-form"
import { EmailVerification } from "./components/auth/email-verification"
import { AgronomistDashboard } from "./components/dashboard/agronomist"
import { FarmerDashboard } from "./components/dashboard/farmer"
import { AuthProvider, useAuth } from "./hooks/use-auth"
import { ProtectedRoute } from "./components/auth/protected-route"

function AppRoutes() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />} />
      <Route
        path="/verify-email"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <EmailVerification />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>{user?.role === "Agronomist" ? <AgronomistDashboard /> : <FarmerDashboard />}</ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
