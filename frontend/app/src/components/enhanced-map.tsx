import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  MapPin,
  Home,
  Wifi,
  WifiOff
} from "lucide-react";
import type { Alert, User } from "@/types";
import { useState, useEffect, useRef, useCallback } from "react"

declare const L: typeof import('leaflet');

interface EnhancedMapProps {
  userRole: "Agronomist" | "Farmer";
  user?: User;
  alerts?: Alert[];
  onAlertClick?: (alert: Alert) => void;
  websocketUrl?: string;
}

export function EnhancedMap({ 
  userRole, 
  user, 
  alerts = [], 
  onAlertClick,
  websocketUrl = "ws://localhost:8000/ws/alerts/"
}: EnhancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentAlerts, setCurrentAlerts] = useState<Alert[]>(alerts);
  const [wsConnected, setWsConnected] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return { color: "#dc2626", bgColor: "bg-red-600", textColor: "text-red-800", bgLight: "bg-red-100" };
      case "High":
        return { color: "#ea580c", bgColor: "bg-orange-500", textColor: "text-orange-800", bgLight: "bg-orange-100" };
      case "Medium":
        return { color: "#ca8a04", bgColor: "bg-yellow-500", textColor: "text-yellow-800", bgLight: "bg-yellow-100" };
      case "Low":
        return { color: "#16a34a", bgColor: "bg-green-500", textColor: "text-green-800", bgLight: "bg-green-100" };
      default:
        return { color: "#6b7280", bgColor: "bg-gray-500", textColor: "text-gray-800", bgLight: "bg-gray-100" };
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

  // Initialize WebSocket connection
  const initWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(websocketUrl);
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
        console.log('WebSocket connected');
        
        // Request alerts with location if available
        if (userLocation) {
          wsRef.current?.send(JSON.stringify({
            type: 'get_alerts',
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 50 // 50km radius
          }));
        } else {
          wsRef.current?.send(JSON.stringify({
            type: 'get_alerts'
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'alerts_list':
            setCurrentAlerts(data.alerts);
            break;
          case 'new_alert':
            setCurrentAlerts(prev => [data.alert, ...prev]);
            break;
          case 'alert_updated':
            setCurrentAlerts(prev => 
              prev.map(alert => alert.id === data.alert.id ? data.alert : alert)
            );
            break;
          case 'alert_deleted':
            setCurrentAlerts(prev => 
              prev.filter(alert => alert.id !== data.alert_id)
            );
            break;
        }
      };

      wsRef.current.onclose = () => {
        setWsConnected(false);
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(initWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setWsConnected(false);
    }
  }, [websocketUrl, userLocation]);

  // Get user's current location
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setUserLocation({ lat: user.latitude, lng: user.longitude });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Casablanca, Morocco
          setUserLocation({ lat: 33.5731, lng: -7.5898 });
        }
      );
    } else {
      // Default to Casablanca, Morocco
      setUserLocation({ lat: 33.5731, lng: -7.5898 });
    }
  }, [user]);

  // Initialize WebSocket when component mounts
  useEffect(() => {
    initWebSocket();
    
    return () => {
      wsRef.current?.close();
    };
  }, [initWebSocket]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initMap();
        };
        document.head.appendChild(script);
      } else if (window.L) {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 10);

      // Add user location marker if available
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

      if (user?.latitude && user?.longitude) {
        const userIcon = window.L.divIcon({
          html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                   <div style="color: white; font-size: 10px;">🏠</div>
                 </div>`,
          className: 'custom-user-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        window.L.marker([user.latitude, user.longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-sm mb-1">Your Location</h3>
              <p class="text-xs text-gray-600">${user.city ? `${user.city}, ` : ''}${user.country || 'Your Farm'}</p>
            </div>
          `);
      }

      mapInstanceRef.current = map;
      setIsMapLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, user]);

  // Update markers when alerts change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    currentAlerts.forEach(alert => {
      const severityData = getSeverityColor(alert.severity);
      const icon = getSeverityIcon(alert.severity);

      const customIcon = window.L.divIcon({
        html: `<div style="background-color: ${severityData.color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
                 <div style="font-size: 12px;">${icon}</div>
               </div>`,
        className: 'custom-alert-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = window.L.marker([alert.latitude, alert.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      const popupContent = `
        <div class="p-3 min-w-[250px]">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-bold text-sm pr-2">${alert.title}</h3>
            <span class="px-2 py-1 text-xs rounded-full ${severityData.bgLight} ${severityData.textColor} whitespace-nowrap">
              ${alert.severity}
            </span>
          </div>
          <p class="text-xs text-gray-600 mb-2">${alert.description}</p>
          <div class="space-y-1 text-xs">
            <div><strong>Crop:</strong> ${alert.crop}</div>
            <div><strong>Category:</strong> ${alert.category}</div>
            <div><strong>Date:</strong> ${alert.date}</div>
            <div><strong>Radius:</strong> ${(alert.radius / 1000).toFixed(1)} km</div>
            ${alert.distance !== undefined ? `<div><strong>Distance:</strong> ${alert.distance} km</div>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Global function for alert click handling
    if (onAlertClick) {
      (window as any).handleAlertClick = (alertId: string) => {
        const alert = currentAlerts.find(a => a.id === alertId);
        if (alert) {
          onAlertClick(alert);
        }
      };
    }
  }, [currentAlerts, isMapLoaded, onAlertClick]);

  // const handleZoomIn = () => {
  //   if (mapInstanceRef.current) {
  //     mapInstanceRef.current.zoomIn();
  //   }
  // };

  // const handleZoomOut = () => {
  //   if (mapInstanceRef.current) {
  //     mapInstanceRef.current.zoomOut();
  //   }
  // };

  const handleRecenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 10);
    }
  };

  // const handleRefreshAlerts = () => {
  //   if (wsRef.current?.readyState === WebSocket.OPEN && userLocation) {
  //     wsRef.current.send(JSON.stringify({
  //       type: 'get_alerts',
  //       lat: userLocation.lat,
  //       lng: userLocation.lng,
  //       radius: 50
  //     }));
  //   }
  // };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">Disconnected</span>
            </>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentAlerts.length} alert{currentAlerts.length !== 1 ? 's' : ''} shown
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 rounded-xl overflow-hidden border shadow-lg">
        <div ref={mapRef} className="w-full h-full z-1"></div>
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            variant="outline"
            size="icon" 
            onClick={handleRecenter}
            className="!bg-background hover:bg-gray-50"
          >
            <Navigation className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomIn();
              }
            }}
            className="!bg-background hover:bg-gray-50"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomOut();
              }
            }}
            className="!bg-background hover:bg-gray-50"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
        {/* Loading overlay */}
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Critical', 'High', 'Medium', 'Low'].map(severity => {
          const count = currentAlerts.filter(alert => alert.severity === severity).length;
          const severityData = getSeverityColor(severity);
          
          return (
            <Card key={severity}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{severity}</p>
                    <p className="text-lg font-bold">{count}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${severityData.bgColor}`}></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Map Legend
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Alert Priority</h5>
              <div className="space-y-1">
                {['Critical', 'High', 'Medium', 'Low'].map(severity => {
                  const severityData = getSeverityColor(severity);
                  const icon = getSeverityIcon(severity);
                  
                  return (
                    <div key={severity} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-white shadow-sm flex items-center justify-center text-xs"
                        style={{ backgroundColor: severityData.color }}
                      >
                        {icon}
                      </div>
                      <span className="text-sm">{severity} Priority</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Locations</h5>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center">
                  <Home className="w-2 h-2 text-white" />
                </div>
                <span className="text-sm">
                  {userRole === "Farmer" ? "Your Farm" : "Your Location"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Instructions */}
      <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        <p>
          {userRole === "Agronomist"
            ? "Click on alert markers to view details. Use the controls to navigate and refresh alerts in real-time."
            : "Your location is marked in blue. Click on alert markers to view details and assess risks to your crops."}
        </p>
      </div>

    </div>
  );
}