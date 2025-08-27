"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, MapPin, Loader2 } from 'lucide-react'
import { alertsApi } from "@/lib/api"
import type { Alert } from "@/types"

export const alertCategories = [
  { value: "disease", label: "Plant Disease", icon: "🦠", color: "bg-red-100 text-red-800" },
  { value: "pest", label: "Pest Alert", icon: "🐛", color: "bg-orange-100 text-orange-800" },
  { value: "weather", label: "Weather Alert", icon: "🌤️", color: "bg-blue-100 text-blue-800" },
  { value: "soil", label: "Soil Issue", icon: "🌱", color: "bg-brown-100 text-brown-800" },
  { value: "irrigation", label: "Irrigation", icon: "💧", color: "bg-cyan-100 text-cyan-800" },
]

export const severityLevels = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "critical", label: "Critical", color: "bg-red-700" },
]

interface AlertCreationFormProps {
  onClose: () => void
  onAlertCreated?: (alert: Alert) => void
}

export function AlertCreationForm({ onClose, onAlertCreated }: AlertCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    severity: "",
    crop: "",
    latitude: "",
    longitude: "",
    radius: "5000", // Default 5km radius
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.severity) newErrors.severity = "Severity is required"
    if (!formData.crop.trim()) newErrors.crop = "Crop type is required"
    if (!formData.latitude || isNaN(Number(formData.latitude))) {
      newErrors.latitude = "Valid latitude is required"
    }
    if (!formData.longitude || isNaN(Number(formData.longitude))) {
      newErrors.longitude = "Valid longitude is required"
    }
    if (!formData.radius || isNaN(Number(formData.radius)) || Number(formData.radius) <= 0) {
      newErrors.radius = "Valid radius is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const alertData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        severity: formData.severity,
        crop: formData.crop.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        radius: Number(formData.radius),
      }

      const newAlert = await alertsApi.createAlert(alertData)
      
      // Call the callback with the new alert
      if (onAlertCreated) {
        onAlertCreated(newAlert)
      }
      
      // Close the form
      onClose()
    } catch (error) {
      console.error("Failed to create alert:", error)
      setErrors({ submit: "Failed to create alert. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
          setErrors(prev => ({ ...prev, location: "Unable to get current location" }))
        }
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Create New Alert</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Alert Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Aphid outbreak in corn fields"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Category and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {alertCategories.map((category) => (
                    <Button
                      key={category.value}
                      type="button"
                      variant={formData.category === category.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("category", category.value)}
                      className="justify-start"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </Button>
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Severity *</label>
                <div className="space-y-2">
                  {severityLevels.map((level) => (
                    <Button
                      key={level.value}
                      type="button"
                      variant={formData.severity === level.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("severity", level.value)}
                      className="w-full justify-start"
                    >
                      <Badge className={`mr-2 ${level.color} text-white`}>
                        {level.label.toUpperCase()}
                      </Badge>
                    </Button>
                  ))}
                </div>
                {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity}</p>}
              </div>
            </div>

            {/* Crop */}
            <div>
              <label className="block text-sm font-medium mb-2">Crop Type *</label>
              <Input
                value={formData.crop}
                onChange={(e) => handleInputChange("crop", e.target.value)}
                placeholder="e.g., Wheat, Corn, Tomatoes"
                className={errors.crop ? "border-red-500" : ""}
              />
              {errors.crop && <p className="text-red-500 text-sm mt-1">{errors.crop}</p>}
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Location *</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  className="flex items-center space-x-1"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Use Current Location</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="Latitude"
                    type="number"
                    step="any"
                    className={errors.latitude ? "border-red-500" : ""}
                  />
                  {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
                </div>
                
                <div>
                  <Input
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="Longitude"
                    type="number"
                    step="any"
                    className={errors.longitude ? "border-red-500" : ""}
                  />
                  {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
                </div>
                
                <div>
                  <Input
                    value={formData.radius}
                    onChange={(e) => handleInputChange("radius", e.target.value)}
                    placeholder="Radius (meters)"
                    type="number"
                    min="100"
                    className={errors.radius ? "border-red-500" : ""}
                  />
                  {errors.radius && <p className="text-red-500 text-sm mt-1">{errors.radius}</p>}
                </div>
              </div>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Provide detailed information about the alert, recommended actions, and any other relevant details..."
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Alert"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
