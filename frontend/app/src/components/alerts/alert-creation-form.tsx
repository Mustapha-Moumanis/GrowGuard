"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { X, Send, Eye, Loader2, MapPin, Rss, MapPinned } from "lucide-react"
import { alertsApi } from "@/lib/api"
import LocationMap from "../location-map"

const AlertFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  cropType: z.string().min(1, "Please select a crop type"),
  category: z.string().min(1, "Please select an alert category"),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  description: z.string().min(20, "Description must be at least 20 characters"),
  validityPeriod: z.string().min(1, "Please select validity period"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string(),
  radius: z.number().min(500).max(50000),
})

interface AlertCreationFormProps {
  onClose: () => void
  onSuccess?: (alert: any) => void
}

export const cropTypes = [
  { value: "wheat", label: "Wheat", icon: "🌾", color: "bg-yellow-100 text-yellow-800" },
  { value: "corn", label: "Corn", icon: "🌽", color: "bg-yellow-100 text-yellow-800" },
  { value: "rice", label: "Rice", icon: "🍚", color: "bg-green-100 text-green-800" },
  { value: "tomatoes", label: "Tomatoes", icon: "🍅", color: "bg-red-100 text-red-800" },
  { value: "potatoes", label: "Potatoes", icon: "🥔", color: "bg-amber-100 text-amber-800" },
  { value: "cotton", label: "Cotton", icon: "☁️", color: "bg-gray-100 text-gray-800" },
  { value: "sunflower", label: "Sunflower", icon: "🌻", color: "bg-yellow-100 text-yellow-800" },
  { value: "canola", label: "Canola", icon: "🌼", color: "bg-yellow-100 text-yellow-800" },
  { value: "lettuce", label: "Lettuce", icon: "🥬", color: "bg-green-100 text-green-800" },
  { value: "carrots", label: "Carrots", icon: "🥕", color: "bg-orange-100 text-orange-800" },
  { value: "onions", label: "Onions", icon: "🧅", color: "bg-purple-100 text-purple-800" },
  { value: "peppers", label: "Peppers", icon: "🌶️", color: "bg-red-100 text-red-800" },
  { value: "cucumbers", label: "Cucumbers", icon: "🥒", color: "bg-green-100 text-green-800" },
  { value: "peas", label: "Peas", icon: "🟢", color: "bg-green-100 text-green-800" },
  { value: "spinach", label: "Spinach", icon: "🥬", color: "bg-green-100 text-green-800" },
];

export const alertCategories = [
  { value: "pest", label: "Pest Outbreak", icon: "🐛", color: "bg-red-100 text-red-800" },
  { value: "disease", label: "Plant Disease", icon: "🦠", color: "bg-orange-100 text-orange-800" },
  { value: "weather", label: "Weather Alert", icon: "🌪️", color: "bg-blue-100 text-blue-800" },
  { value: "harvest", label: "Harvest Ready", icon: "🌾", color: "bg-green-100 text-green-800" },
  { value: "equipment", label: "Equipment Share", icon: "🚜", color: "bg-purple-100 text-purple-800" },
  { value: "advisory", label: "Advisory", icon: "💡", color: "bg-yellow-100 text-yellow-800" },
]

export const severityLevels = [
  { value: "Low", label: "Low", icon: "🟢", color: "bg-green-500" },
  { value: "Medium", label: "Medium", icon: "🟠", color: "bg-yellow-500" },
  { value: "High", label: "High", icon: "🔴", color: "bg-orange-500" },
  { value: "Critical", label: "Critical", icon: "🚨", color: "bg-red-500" },
]

const radiusOptions = [
  { value: 1000, label: "1km" },
  { value: 5000, label: "5km" },
  { value: 10000, label: "10km" },
  { value: 25000, label: "25km" },
]

export function AlertCreationForm({ onClose, onSuccess }: AlertCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const form = useForm<z.infer<typeof AlertFormSchema>>({
    resolver: zodResolver(AlertFormSchema),
    defaultValues: {
      title: "",
      cropType: "",
      category: "",
      severity: "Medium",
      description: "",
      latitude: 0,
      longitude: 0,
      address: "",
      radius: 5000,
      validityPeriod: "1w",
    },
  })

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number
    longitude: number
    address?: string
    country?: string
    region?: string
    city?: string
  } | null>(null);

  // Watch form latitude and longitude changes to update map
  const watchedLat = form.watch("latitude")
  const watchedLng = form.watch("longitude")

  useEffect(() => {
    // Always update selectedLocation when coordinates change
    if (!isNaN(watchedLat) && !isNaN(watchedLng)) {
      setSelectedLocation(prev => ({
        ...prev,
        latitude: watchedLat,
        longitude: watchedLng,
      }))
    }
  }, [watchedLat, watchedLng])

  useEffect(() => {
    if (selectedLocation &&
      (selectedLocation.latitude !== form.getValues("latitude") ||
        selectedLocation.longitude !== form.getValues("longitude"))) {
      form.setValue("latitude", selectedLocation.latitude)
      form.setValue("longitude", selectedLocation.longitude)
      form.setValue("address", selectedLocation.address ?? "")
    }
  }, [selectedLocation, form])

  const handleSubmit = async (data: z.infer<typeof AlertFormSchema>) => {
    setIsLoading(true)

    try {

      const alertData = {
        title: data.title,
        description: data.description,
        crop: data.cropType,
        category: data.category,
        severity: data.severity,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        radius: data.radius,
        date: new Date().toISOString().split("T")[0],
      }

      const newAlert = await alertsApi.createAlert(alertData)

      onSuccess?.(newAlert)
      onClose()
    } catch (error: any) {
      let errorMessage = "Failed to publish alert"
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error("Failed to publish alert", {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async () => {
    const isValid = await form.trigger()

    if (isValid) {
      const formData = form.getValues()
      await handleSubmit(formData)
    } else {
      toast.error("Please check the form for errors")
    }
  }

  if (showPreview) {
    const formData = form.getValues()
    const selectedCrop = cropTypes.find((c) => c.value === formData.cropType)
    const selectedCategory = alertCategories.find((c) => c.value === formData.category)
    const selectedSeverity = severityLevels.find((s) => s.value === formData.severity)

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="bg-bg-primary w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview Alert</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-bg-secondary border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {selectedCategory && (
                    <Badge className={selectedCategory.color}>
                      {selectedCategory.icon} {selectedCategory.label}
                    </Badge>
                  )}
                  {selectedCrop && (
                    <Badge className={selectedCrop.color}>
                      {selectedCrop.icon} {selectedCrop.label}
                    </Badge>
                  )}
                </div>
                <Badge className={selectedSeverity?.color}>{selectedSeverity?.label}</Badge>
              </div>

              <h3 className="font-bold text-lg sm:text-xl mb-2">{formData.title}</h3>

              <div className="flex items-center text-sm mb-1">
                <MapPin className="h-4 w-4 stroke-[2.5]" />
                <span className="font-semibold mx-1">Location:</span>&nbsp;
                <span>{formData.address}</span>
              </div>

              <div className="flex items-center text-sm mb-3">
                <Rss className="h-3.5 w-3.5 stroke-[2.5]" />
                <span className="font-semibold mx-1">Coverage Area:</span>
                <span>{(formData.radius / 1000).toFixed(0)} Km radius</span>
              </div>

              <p className="text-sm mb-4 leading-relaxed whitespace-pre-wrap">{formData.description}</p>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent font-bold hover:bg-accent hover:text-primary">
                  <span>View on Map</span>
                  <span className="p-1 rounded-sm bg-primary text-white">
                    <MapPinned className="h-3.5 w-3.5" />
                  </span>
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowPreview(false)} variant="outline" className="flex-1">
                Edit
              </Button>
              <Button onClick={() => handleSubmit(form.getValues())} className="flex-1" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Publish Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-bg-primary w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Alert</CardTitle>
              <CardDescription>Share important information with farmers in your area</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <div className="space-y-6">
              {/* Quick Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full !border-border/25">
                            <SelectValue placeholder="Select crop" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 bg-bg-primary text-text-primary border border-border/25 rounded-lg">
                          {cropTypes.map((crop) => (
                            <SelectItem key={crop.value} value={crop.value}>
                              {crop.icon} {crop.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-error" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full !border-border/25">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 bg-bg-primary text-text-primary border border-border/25 rounded-lg">
                          {alertCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.icon} {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-error" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Title *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="e.g., Urgent: Aphid outbreak in wheat fields" {...field} />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              {/* Severity */}
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity Level *</FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        {severityLevels.map((level, index) => (
                          <>
                            <Button
                              key={level.value}
                              type="button"
                              variant={field.value === level.value ? "default" : "outline"}
                              className={`flex-1 w-full h-9 font-bold ${field.value === level.value ? `${level.color}` : ``}`}
                              onClick={() => field.onChange(level.value)}
                            >
                              <div className="text-center">
                                <div className="text-xs">{level.label}</div>
                              </div>
                            </Button>
                            {index < severityLevels.length - 1 && <Separator orientation="vertical" />}
                          </>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              {/* Coordinates */}
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="e.g., 40.7128"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage className="text-error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="e.g., -74.0060"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage className="text-error" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-2 ">
                <LocationMap selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
              </div>

              {/* Coverage Radius */}
              <FormField
                control={form.control}
                name="radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coverage Area</FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        {radiusOptions.map((option, index) => (
                          <>
                            <Button
                              key={option.value}
                              type="button"
                              variant={field.value === option.value ? "default" : "outline"}
                              onClick={() => field.onChange(option.value)}
                              className={`flex-1 w-full h-9 font-bold ${field.value === option.value ? "bg-primary text-primary-foreground" : "text-text-secondary"}`}
                            >
                              {option.label}
                            </Button>
                            {index < radiusOptions.length - 1 && <Separator orientation="vertical" />}
                          </>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the situation, symptoms, recommended actions, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={isLoading}
                  onClick={onSubmit}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Publish Alert
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
