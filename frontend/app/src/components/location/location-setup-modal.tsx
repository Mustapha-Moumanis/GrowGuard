"use client"
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2, X } from "lucide-react";
import { userApi } from "@/lib/api";
import type { User } from "@/types";
import LocationMap from "../location-map";

interface LocationSetupModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onLocationUpdated: (user: User) => void 
}

export function LocationSetupModal({ user, isOpen, onClose, onLocationUpdated }: LocationSetupModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number
    longitude: number
    address?: string
    country?: string
    region?: string
    city?: string
  } | null>(null);
  

  const handleSaveLocation = async () => {
    if (!selectedLocation || !selectedLocation.country || !selectedLocation.region || !selectedLocation.city) {
      toast.error("Invalid location", {
        description: "Please select a valid location on the map.",
        duration: 4000,
      });
      return;
    }
  
    setIsLoading(true);
    
    try {
      const locationData = {
        country: selectedLocation.country,
        region: selectedLocation.region,
        city: selectedLocation.city,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      };
  
      const updatedUser = await userApi.updateLocation(locationData);
  
      toast.success("Farm location saved!", {
        description: `${selectedLocation.city}, ${selectedLocation.region}, ${selectedLocation.country}`,
        duration: 4000,
      });
  
      onLocationUpdated(updatedUser);
      onClose();
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location", {
        description: "Please try again.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Select Farm Location
          </CardTitle>
          <CardDescription className="text-base">
            Click on the map to select your farm location
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="space-y-4">
            <LocationMap user={user} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveLocation}
                disabled={!selectedLocation || isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Location"
                )}
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Your farm location helps us provide relevant agricultural alerts and weather updates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}