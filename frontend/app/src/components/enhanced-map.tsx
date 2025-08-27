import { Button } from "@/components/ui/button";
import {
  Navigation,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type { Alert, User } from "@/types";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // ✅ Load Leaflet CSS once globally
// import "leaflet/dist/images/marker-shadow.png";

interface EnhancedMapProps {
  user?: User;
  alerts?: Alert[];
  focusCoordinates?: { lat: number; lng: number } | null;
}

export function EnhancedMap({
  user,
  alerts = [],
  focusCoordinates = null
}: EnhancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "#dc2626";
      case "High":
        return "#ea580c";
      case "Medium":
        return "#ca8a04";
      case "Low":
        return "#16a34a";
      default:
        return "#6b7280";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "⚠️";
      case "High":
        return "🔴";
      case "Medium":
        return "🟡";
      case "Low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setUserLocation({ lat: user.latitude, lng: user.longitude });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.warn("Location permission denied by user.");
          } else {
            console.error("Geolocation error:", error.message);
          }

          // Default to Casablanca, Morocco
          setUserLocation({ lat: 33.5731, lng: -7.5898 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.warn("Geolocation not supported by this browser.");
      setUserLocation({ lat: 33.5731, lng: -7.5898 });
    }
  }, [user]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (mapInstanceRef.current) {
      // Clean up old map instance
      mapInstanceRef.current.off();
      mapInstanceRef.current.remove();
      markersRef.current = [];
    }

    const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);

    if (user?.latitude && user?.longitude) {
      const userIcon = L.divIcon({
        html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                 <div style="color: white; font-size: 10px;">🏠</div>
               </div>`,
        className: "custom-user-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([user.latitude, user.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 12px;">
            <strong>Your Location</strong><br/>
            ${user.city ? `${user.city}, ` : ""}${user.country || "Your Farm"}
          </div>
        `);
    }

    mapInstanceRef.current = map;
    setIsMapLoaded(true);

    return () => {
      map.off();
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
    };
  }, [userLocation, user]);

  useEffect(() => {
    
    if (!mapInstanceRef.current || !isMapLoaded) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current!.removeLayer(marker);
    });
    markersRef.current = [];

    alerts.forEach(alert => {
      const color = getSeverityColor(alert.severity);
      const icon = getSeverityIcon(alert.severity);

      const customIcon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                 <div style="font-size: 12px;">${icon}</div>
               </div>`,
        className: "custom-alert-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([alert.latitude, alert.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current!);

      const popupContent = `
        <div style="font-size: 12px; min-width: 200px;">
          <strong>${alert.title}</strong><br/>
          <em>${alert.severity}</em><br/><br/>
          ${alert.description}<br/><br/>
          Crop: ${alert.crop}<br/>
          Category: ${alert.category}<br/>
          Date: ${alert.date}<br/>
          Radius: ${(alert.radius / 1000).toFixed(1)} km<br/>
          ${alert.distance !== undefined ? `Distance: ${alert.distance} km` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
      // // Global function for alert click handling
      // if (onAlertClick) {
      //   (window as any).handleAlertClick = (alertId: string) => {
      //     const alert = alerts.find(a => a.id === alertId);
      //     console.log("Alert clicked:", alert?.id);
      //     if (alert) {
      //       onAlertClick(alert);
      //     }
      //   };
      // }
    });
  }, [alerts, isMapLoaded]);
  // }, [alerts, isMapLoaded, onAlertClick]);

  useEffect(() => {
    if (focusCoordinates && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [focusCoordinates.lat, focusCoordinates.lng], 
        15 // Zoom level
      );
      
      // Optionally find and open the marker's popup
      const marker = markersRef.current.find(m => 
        m.getLatLng().lat === focusCoordinates.lat && 
        m.getLatLng().lng === focusCoordinates.lng
      );
      
      if (marker) {
        marker.openPopup();
      }
    }
  }, [focusCoordinates]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 10);
    }
  };

  return (
    <div className="relative h-full overflow-hidden border shadow-lg">
      <div ref={mapRef} className="w-full h-full z-1"></div>

      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRecenter}
          className="text-black !bg-accent hover:bg-gray-50"
        >
          <Navigation className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
          }}
          className="text-black !bg-accent hover:bg-gray-50"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
          }}
          className="text-black !bg-accent hover:bg-gray-50"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
  focusOnAlert
}
