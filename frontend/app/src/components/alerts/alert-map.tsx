"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Layers, ZoomIn, ZoomOut, Maximize2, Minimize2, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import type { Alert } from "@/types"
import { toast } from "sonner"

// Mock map implementation - replace with actual map library like Leaflet or Google Maps
interface MapMarker {
  id: string
  lat: number
  lng: number
  alert: Alert
  severity: string
  category: string
}

interface MapViewport {
  center: [number, number]
  zoom: number
}

const SEVERITY_COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
}

const CATEGORY_ICONS = {
  pest_outbreak: "🐛",
  disease: "🦠",
  weather_damage: "⛈️",
  harvest_ready: "🌾",
  equipment_sharing: "🚜",
  general: "📢",
}

interface AlertMapProps {
  alerts?: Alert[]
  selectedAlert?: Alert | null
  onAlertSelect?: (alert: Alert) => void
  className?: string
  isFullscreen?: boolean
  onFullscreenToggle?: () => void
}

export function AlertMap({
  alerts = [],
  selectedAlert,
  onAlertSelect,
  className,
  isFullscreen = false,
  onFullscreenToggle,
}: AlertMapProps) {
  const { user } = useAuth()
  const mapRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<MapViewport>({
    center: [user?.latitude || 40.7128, user?.longitude || -74.006], // Default to NYC
    zoom: 10,
  })
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<"roadmap" | "satellite" | "terrain">("roadmap")
  const [showClusters, setShowClusters] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Convert alerts to map markers
    const newMarkers: MapMarker[] = alerts.map((alert) => ({
      id: alert.id,
      lat: alert.location.lat,
      lng: alert.location.lng,
      alert,
      severity: alert.severity,
      category: alert.category,
    }))
    setMarkers(newMarkers)
  }, [alerts])

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported")
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setViewport({
          center: [latitude, longitude],
          zoom: 12,
        })
        setIsLoading(false)
        toast.success("Location updated")
      },
      (error) => {
        setIsLoading(false)
        toast.error("Failed to get location")
      },
    )
  }

  const zoomIn = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 18),
    }))
  }

  const zoomOut = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 1),
    }))
  }

  const handleMarkerClick = (marker: MapMarker) => {
    onAlertSelect?.(marker.alert)
    setViewport((prev) => ({
      ...prev,
      center: [marker.lat, marker.lng],
    }))
  }

  // Cluster nearby markers
  const clusteredMarkers = showClusters ? clusterMarkers(markers, viewport.zoom) : markers

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Alert Map
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Map Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setMapStyle(mapStyle === "roadmap" ? "satellite" : mapStyle === "satellite" ? "terrain" : "roadmap")
                }
              >
                <Layers className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={getUserLocation} disabled={isLoading}>
                <Target className="w-4 h-4" />
              </Button>

              {onFullscreenToggle && (
                <Button variant="outline" size="sm" onClick={onFullscreenToggle}>
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* Map Container */}
        <div
          ref={mapRef}
          className={cn("relative bg-gray-100 dark:bg-gray-800", isFullscreen ? "h-[calc(100vh-120px)]" : "h-96")}
          style={{
            backgroundImage:
              mapStyle === "satellite"
                ? 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23065f46"/><circle cx="20" cy="20" r="2" fill="%23047857"/><circle cx="80" cy="30" r="1.5" fill="%23059669"/><circle cx="60" cy="70" r="1" fill="%23047857"/></svg>\')'
                : mapStyle === "terrain"
                  ? 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><path d="M0,60 Q25,40 50,60 T100,60 L100,100 L0,100 Z" fill="%23d1d5db"/><path d="M0,80 Q25,70 50,80 T100,80 L100,100 L0,100 Z" fill="%23e5e7eb"/></svg>\')'
                  : 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f9fafb"/><line x1="0" y1="25" x2="100" y2="25" stroke="%23e5e7eb" strokeWidth="0.5"/><line x1="0" y1="50" x2="100" y2="50" stroke="%23e5e7eb" strokeWidth="0.5"/><line x1="0" y1="75" x2="100" y2="75" stroke="%23e5e7eb" strokeWidth="0.5"/><line x1="25" y1="0" x2="25" y2="100" stroke="%23e5e7eb" strokeWidth="0.5"/><line x1="50" y1="0" x2="50" y2="100" stroke="%23e5e7eb" strokeWidth="0.5"/><line x1="75" y1="0" x2="75" y2="100" stroke="%23e5e7eb" strokeWidth="0.5"/></svg>\')',
            backgroundSize: "50px 50px",
          }}
        >
          {/* User Location Marker */}
          {user?.latitude && user?.longitude && (
            <div
              className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${((user.longitude + 180) / 360) * 100}%`,
                top: `${((90 - user.latitude) / 180) * 100}%`,
              }}
              title="Your location"
            />
          )}

          {/* Alert Markers */}
          {clusteredMarkers.map((marker) => {
            const isSelected = selectedAlert?.id === marker.id
            const isHovered = hoveredMarker === marker.id
            const isCluster = "count" in marker

            return (
              <div
                key={marker.id}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20",
                  isSelected && "z-30",
                  isHovered && "scale-110",
                )}
                style={{
                  left: `${((marker.lng + 180) / 360) * 100}%`,
                  top: `${((90 - marker.lat) / 180) * 100}%`,
                }}
                onClick={() => !isCluster && handleMarkerClick(marker)}
                onMouseEnter={() => setHoveredMarker(marker.id)}
                onMouseLeave={() => setHoveredMarker(null)}
              >
                {isCluster ? (
                  // Cluster marker
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                    {(marker as any).count}
                  </div>
                ) : (
                  // Individual alert marker
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs",
                      isSelected && "ring-2 ring-blue-500 ring-offset-2",
                    )}
                    style={{
                      backgroundColor: SEVERITY_COLORS[marker.severity as keyof typeof SEVERITY_COLORS],
                    }}
                    title={marker.alert.title}
                  >
                    {CATEGORY_ICONS[marker.category as keyof typeof CATEGORY_ICONS]}
                  </div>
                )}

                {/* Tooltip */}
                {isHovered && !isCluster && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-40">
                    {marker.alert.title}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Selected Alert Coverage Area */}
          {selectedAlert && (
            <div
              className="absolute border-2 border-blue-500 border-dashed rounded-full bg-blue-500/10 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{
                left: `${((selectedAlert.location.lng + 180) / 360) * 100}%`,
                top: `${((90 - selectedAlert.location.lat) / 180) * 100}%`,
                width: `${(selectedAlert.location.radius / 1000) * 2}px`, // Simplified radius calculation
                height: `${(selectedAlert.location.radius / 1000) * 2}px`,
              }}
            />
          )}
        </div>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
          <Button variant="outline" size="sm" onClick={zoomIn} className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut} className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 z-30">
          <h4 className="text-sm font-semibold mb-2">Severity Levels</h4>
          <div className="space-y-1">
            {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
              <div key={severity} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: color }} />
                <span className="capitalize">{severity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-4 flex items-center gap-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span className="text-sm">Updating location...</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Selected Alert Info */}
      {selectedAlert && (
        <div className="absolute bottom-4 right-4 max-w-sm z-30">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge
                  className={cn(
                    "text-white",
                    selectedAlert.severity === "low" && "bg-green-500",
                    selectedAlert.severity === "medium" && "bg-yellow-500",
                    selectedAlert.severity === "high" && "bg-orange-500",
                    selectedAlert.severity === "critical" && "bg-red-500",
                  )}
                >
                  {selectedAlert.severity}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => onAlertSelect?.(null as any)} className="h-6 w-6 p-0">
                  ×
                </Button>
              </div>
              <CardTitle className="text-sm">{selectedAlert.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{selectedAlert.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>🌾 {selectedAlert.cropType}</span>
                <span>📍 {selectedAlert.location.address}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}

// Helper function to cluster nearby markers
function clusterMarkers(
  markers: MapMarker[],
  zoom: number,
): (MapMarker | { id: string; lat: number; lng: number; count: number })[] {
  if (zoom > 12) return markers // Don't cluster at high zoom levels

  const clustered: any[] = []
  const processed = new Set<string>()
  const clusterDistance = 0.01 // Adjust based on zoom level

  markers.forEach((marker) => {
    if (processed.has(marker.id)) return

    const nearby = markers.filter(
      (other) =>
        !processed.has(other.id) &&
        Math.abs(marker.lat - other.lat) < clusterDistance &&
        Math.abs(marker.lng - other.lng) < clusterDistance,
    )

    if (nearby.length > 1) {
      // Create cluster
      const centerLat = nearby.reduce((sum, m) => sum + m.lat, 0) / nearby.length
      const centerLng = nearby.reduce((sum, m) => sum + m.lng, 0) / nearby.length

      clustered.push({
        id: `cluster-${marker.id}`,
        lat: centerLat,
        lng: centerLng,
        count: nearby.length,
      })

      nearby.forEach((m) => processed.add(m.id))
    } else {
      clustered.push(marker)
      processed.add(marker.id)
    }
  })

  return clustered
}
