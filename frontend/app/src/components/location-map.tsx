import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Crosshair, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { User } from "@/types";

declare const L: typeof import('leaflet');

interface GeocodingResult {
    country: string
    region: string
    city: string
    address: string
}

type Location = {
    latitude: number
    longitude: number
    address?: string
    country?: string
    region?: string
    city?: string
};

interface LocationProps {
    user?: User | null;
    selectedLocation: Location | null;
    setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>;
}

export default function LocationMap({user = null, selectedLocation, setSelectedLocation} : LocationProps) {
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string>("");
    const [isMapReady, setIsMapReady] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number
        longitude: number
        accuracy?: number
        address?: string
    } | null>(null);
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const isInitializingRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

	const pinIcon = L.icon({
		iconUrl: "/pin.png",
		iconSize: [44, 52],
		iconAnchor: [22, 52],
		popupAnchor: [0, -52],
	});

    // Clean up function
    const cleanupMap = () => {
        if (markerRef.current) {
            try {
                markerRef.current.remove();
            } catch (e) {
                console.warn('Error removing marker:', e);
            }
            markerRef.current = null;
        }
        if (mapInstanceRef.current) {
            try {
                mapInstanceRef.current.off(); // Remove all event listeners
                mapInstanceRef.current.remove();
            } catch (e) {
                console.warn('Error removing map:', e);
            }
            mapInstanceRef.current = null;
        }
        setIsMapReady(false);
    };

    // Initialize map
    useEffect(() => {
        const initMap = () => {
            if (!mapRef.current || mapInstanceRef.current || isInitializingRef.current) return;
            
            isInitializingRef.current = true;

            try {
                // Ensure container is visible and has dimensions
                if (!mapRef.current.offsetWidth || !mapRef.current.offsetHeight) {
                    console.warn('Map container has no dimensions, retrying...');
                    isInitializingRef.current = false;
                    setTimeout(initMap, 100);
                    return;
                }

                // Fix: Ensure we have valid coordinates with proper fallback
                const center = selectedLocation 
                    ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
                    : currentLocation 
                    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
                    : { lat: 33.5731, lng: -7.5898 }; // Default to Casablanca
                
                const map = L.map(mapRef.current, {
                    center: [center.lat, center.lng],
                    zoom: 13,
                    zoomControl: false,
                    attributionControl: true,
                    fadeAnimation: false, // Disable fade animation to prevent DOM issues
                    zoomAnimation: true,
                    markerZoomAnimation: true
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(map);
                if (user?.latitude && user?.longitude) {
                    const userIcon = L.divIcon({
                      html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                               <div style="color: white; font-size: 10px;">🏠</div>
                             </div>`,
                      className: 'custom-user-marker',
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    });
            
                    L.marker([user.latitude, user.longitude], { icon: userIcon })
                      .addTo(map)
                      .bindPopup(`
                        <div class="">
                          <h3 class="font-bold text-sm">Your Old Location</h3>
                          <p class="text-xs text-gray-600">${user.city ? `${user.city}, ` : ''}${user.country || 'Your Farm'}</p>
                        </div>
                    `);
                }

                // Add click handler
                map.on('click', async (e: L.LeafletMouseEvent) => {
                    const { lat, lng } = e.latlng;
                    
                    try {
                        const result = await reverseGeocode(lat, lng);
                        if (result) {
                            setSelectedLocation({
                                latitude: lat,
                                longitude: lng,
                                country: result.country,
                                region: result.region,
                                city: result.city,
                                address: result.address
                            });

                            // Update marker safely
                            if (markerRef.current) {
                                markerRef.current.setLatLng([lat, lng]);
                            } else {
                                markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
                            }
                            markerRef.current.bindPopup(`
                                <b>${result.city || 'Unknown city'}</b><br>
                                ${result.region || 'Unknown region'}<br>
                                ${result.country || 'Unknown country'}
                            `).openPopup();

                            toast.success("Location selected", {
                                description: result.address,
                                duration: 4000,
                            });
                        }
                    } catch (error) {
                        console.error("Reverse geocoding failed:", error);
                        toast.error("Failed to get location details", {
                            description: "Please try selecting another location",
                            duration: 4000,
                        });
                    }
                });

                // Wait for map to be ready before adding markers
                map.whenReady(() => {
                    // Force map to invalidate size to ensure proper rendering
                    setTimeout(() => {
                        if (map && !(map.getContainer() as any)._leaflet_id) {
                            console.warn('Map container lost leaflet ID, reinitializing...');
                            return;
                        }
                        
                        try {
                            map.invalidateSize();
                        } catch (e) {
                            console.warn('Error invalidating map size:', e);
                        }
                    }, 100);

                    // Add initial marker if location is selected
                    if (selectedLocation) {
                        markerRef.current = L.marker(
							[selectedLocation.latitude, selectedLocation.longitude],
							{ icon: pinIcon }
						).addTo(map);
                        markerRef.current.bindPopup(`
                            <b>${selectedLocation.city || 'Unknown city'}</b><br>
                            ${selectedLocation.region || 'Unknown region'}<br>
                            ${selectedLocation.country || 'Unknown country'}
                        `).openPopup();
                    }
                    
                    mapInstanceRef.current = map;
                    setIsMapReady(true);
                    isInitializingRef.current = false;
                });

                // Handle map errors
                map.on('error', (error) => {
                    console.error('Map error:', error);
                    toast.error("Map error", {
                        description: "There was an issue with the map. Please refresh the page.",
                        duration: 5000,
                    });
                });

            } catch (error) {
                console.error('Map initialization error:', error);
                isInitializingRef.current = false;
                toast.error("Map initialization failed", {
                    description: "Please refresh the page and try again.",
                    duration: 5000,
                });
            }
        };

        const loadLeaflet = async () => {
            if (typeof window !== 'undefined') {
                if (!window.L) {
                    // Load Leaflet CSS
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(link);

                    // Load Leaflet JS
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = () => {
                        // Wait for DOM to be ready and container to have dimensions
                        setTimeout(initMap, 200);
                    };
                    document.head.appendChild(script);
                } else {
                    // Wait for DOM to be ready and container to have dimensions
                    setTimeout(initMap, 200);
                }
            }
        };

        loadLeaflet();

        return cleanupMap;
    }, [selectedLocation, currentLocation]);

    const reverseGeocode = async (latitude: number, longitude: number): Promise<GeocodingResult | null> => {
        try {
            const bigDataResult = await reverseGeocodeWithBigDataCloud(latitude, longitude);
            if (bigDataResult) return bigDataResult;
            
            const nominatimResult = await reverseGeocodeWithNominatim(latitude, longitude);
            if (nominatimResult) return nominatimResult;

            return null;
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            return null;
        }
    };

    const reverseGeocodeWithNominatim = async (latitude: number, longitude: number): Promise<GeocodingResult | null> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Agricultural-Farm-Location/1.0'
                    },
                    signal: AbortSignal.timeout(5000)
                }
            );
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data && data.address) {
                const addressParts = [
                    data.address.city || data.address.town || data.address.village,
                    data.address.state || data.address.region,
                    data.address.country
                ].filter(Boolean);
                
                const address = data.display_name || addressParts.join(', ');
                
                return {
                    country: data.address.country || "",
                    region: data.address.state || data.address.region || "",
                    city: data.address.city || data.address.town || data.address.village || "",
                    address: address
                };
            }
            
            return null;
        } catch (error) {
            console.warn('Nominatim geocoding failed:', error);
            return null;
        }
    };

    const reverseGeocodeWithBigDataCloud = async (latitude: number, longitude: number): Promise<GeocodingResult | null> => {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: AbortSignal.timeout(5000)
                }
            );
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            const addressParts = [
                data.city || data.locality,
                data.principalSubdivision,
                data.countryName
            ].filter(Boolean);
            
            const address = addressParts.join(', ');
            
            if (address) {
                return {
                    country: data.countryName || "",
                    region: data.principalSubdivision || "",
                    city: data.city || data.locality || "",
                    address: address
                };
            }
            
            return null;
        } catch (error) {
            console.warn('BigDataCloud geocoding failed:', error);
            return null;
        }
    };

    const getCurrentLocation = async () => {
        setIsGettingLocation(true);
        setLocationError("");

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser.");
            setIsGettingLocation(false);
            toast.error("Geolocation not supported", {
                description: "Please select your location on the map.",
                duration: 4000,
            });
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                
                try {
                    const result = await reverseGeocode(latitude, longitude);
                    
                    if (result) {
                        setCurrentLocation({ 
                            latitude, 
                            longitude, 
                            accuracy: accuracy ? Math.round(accuracy) : undefined,
                            address: result.address
                        });

                        setSelectedLocation({
                            latitude: latitude,
                            longitude: longitude,
                            country: result.country,
                            region: result.region,
                            city: result.city,
                            address: result.address
                        });

                        // Update map view safely
                        if (mapInstanceRef.current && isMapReady) {
                            try {
                                mapInstanceRef.current.setView([latitude, longitude], 13);
                                if (markerRef.current) {
                                    markerRef.current.setLatLng([latitude, longitude]);
                                } else {
                                    markerRef.current = L.marker([latitude, longitude], { icon: pinIcon }).addTo(
										mapInstanceRef.current
									);
                                }
                                markerRef.current.bindPopup(`
                                    <b>${result.city || 'Unknown city'}</b><br>
                                    ${result.region || 'Unknown region'}<br>
                                    ${result.country || 'Unknown country'}
                                `).openPopup();
                            } catch (error) {
                                console.error('Error updating map view:', error);
                            }
                        }

                        toast.success("Location detected!", {
                            description: `${result.city}, ${result.region}, ${result.country}`,
                            duration: 4000,
                        });
                    } else {
                        setCurrentLocation({ 
                            latitude, 
                            longitude, 
                            accuracy: accuracy ? Math.round(accuracy) : undefined
                        });

                        setSelectedLocation({
                            latitude: latitude,
                            longitude: longitude,
                            country: "",
                            region: "",
                            city: "",
                        });

                        // Update map view even without geocoding
                        if (mapInstanceRef.current && isMapReady) {
                            try {
                                mapInstanceRef.current.setView([latitude, longitude], 13);
                                if (markerRef.current) {
                                    markerRef.current.setLatLng([latitude, longitude]);
                                } else {
                                    markerRef.current = L.marker([latitude, longitude], { icon: pinIcon }).addTo(mapInstanceRef.current);
                                }
                                markerRef.current.bindPopup(`
                                    <b>Selected Location</b><br>
                                    ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                                `).openPopup();
                            } catch (error) {
                                console.error('Error updating map view:', error);
                            }
                        }

                        toast.success("Coordinates obtained!", {
                            description: "Please select your exact location on the map.",
                            duration: 4000,
                        });
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    setCurrentLocation({ 
                        latitude, 
                        longitude, 
                        accuracy: accuracy ? Math.round(accuracy) : undefined
                    });
                    
                    toast.success("Coordinates obtained!", {
                        description: "Please select your exact location on the map.",
                        duration: 4000,
                    });
                }
                
                setIsGettingLocation(false);
            },
            (error) => {
                let errorMessage = "Failed to get location";
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied. Please enable location permissions.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out.";
                        break;
                    default:
                        errorMessage = "An unknown error occurred.";
                }
                
                setLocationError(errorMessage);
                setIsGettingLocation(false);

                toast.error("Location Error", {
                    description: errorMessage,
                    duration: 6000,
                });
            },
            options
        );
    };

    const handleZoomIn = () => {
        if (mapInstanceRef.current && isMapReady) {
            try {
                // Force map to invalidate size before zooming
                mapInstanceRef.current.invalidateSize();
                
                // Add small delay to ensure DOM is ready
                setTimeout(() => {
                    if (mapInstanceRef.current && !(mapInstanceRef.current.getContainer() as any)._leaflet_id) {
                        console.warn('Map container lost leaflet ID during zoom');
                        return;
                    }
                    
                    try {
                        mapInstanceRef.current?.zoomIn();
                    } catch (error) {
                        console.error('Zoom in error:', error);
                        toast.error("Zoom error", {
                            description: "Unable to zoom in. Please try again.",
                            duration: 3000,
                        });
                    }
                }, 50);
            } catch (error) {
                console.error('Zoom preparation error:', error);
                toast.error("Zoom error", {
                    description: "Unable to zoom in. Please try again.",
                    duration: 3000,
                });
            }
        }
    };

    const handleZoomOut = () => {
        if (mapInstanceRef.current && isMapReady) {
            try {
                // Force map to invalidate size before zooming
                mapInstanceRef.current.invalidateSize();
                
                // Add small delay to ensure DOM is ready
                setTimeout(() => {
                    if (mapInstanceRef.current && !(mapInstanceRef.current.getContainer() as any)._leaflet_id) {
                        console.warn('Map container lost leaflet ID during zoom');
                        return;
                    }
                    
                    try {
                        mapInstanceRef.current?.zoomOut();
                    } catch (error) {
                        console.error('Zoom out error:', error);
                        toast.error("Zoom error", {
                            description: "Unable to zoom out. Please try again.",
                            duration: 3000,
                        });
                    }
                }, 50);
            } catch (error) {
                console.error('Zoom preparation error:', error);
                toast.error("Zoom error", {
                    description: "Unable to zoom out. Please try again.",
                    duration: 3000,
                });
            }
        }
    };

    return (
        <div ref={containerRef}>
            {/* <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="h-12 w-full"
            >
                {isGettingLocation ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Auto-detect
                    </>
                ) : (
                    <>
                        <Crosshair className="w-5 h-5 mr-2" />
                        Auto-detect
                    </>
                )}
            </Button> */}

            {/* Map container */}
            <div className="relative h-64 rounded-lg overflow-hidden border mt-2">
                <div ref={mapRef} className="w-full h-full z-0"></div>
                {!isMapReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
                        </div>
                    </div>
                )}
                {selectedLocation && isMapReady && (
                    <div className="absolute bottom-2 left-2 bg-white dark:bg-primary p-2 rounded-lg shadow-md text-xs z-10">
                        Selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                    </div>
                )}
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="!bg-background hover:bg-gray-50"
                    >
                        {isGettingLocation ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Crosshair className="w-4 h-4" />
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={!isMapReady}
                        className="!bg-background hover:bg-gray-50"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={!isMapReady}
                        className="!bg-background hover:bg-gray-50"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            {locationError && (
                <Alert variant="destructive" className="mt-2 text-error">
                    <AlertDescription>{locationError}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}