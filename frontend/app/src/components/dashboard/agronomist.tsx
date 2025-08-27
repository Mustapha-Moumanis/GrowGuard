"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, CirclePlus, ChevronDown, AlertTriangle } from "lucide-react"
import { EnhancedMap } from "../enhanced-map"
import type { Alert } from "@/types"
import { alertsApi } from "@/lib/api"
import { AlertCreationForm } from "../alerts/alert-creation-form"
import { Header } from "./Header"
import { ProfileModal } from "./profile-modal"
import { AlertCard } from "../alerts/alert-card"

export function AgronomistDashboard() {
  const [showPublishForm, setShowPublishForm] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCrop, setSelectedCrop] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const { user } = useAuth()
  const [focusCoordinates, setFocusCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([])

  const loadAlerts = async () => {
    try {
      const alerts = await alertsApi.getMyAlerts();
      setAlerts(alerts);
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadAlerts();
  }, [])

  const cropOptions = [
    { value: "all", label: "Crops", icon: "🌿" },
    { value: "wheat", label: "Wheat", icon: "🌾" },
    { value: "corn", label: "Corn", icon: "🌽" },
    { value: "rice", label: "Rice", icon: "🍚" },
    { value: "tomatoes", label: "Tomatoes", icon: "🍅" },
    { value: "potatoes", label: "Potatoes", icon: "🥔" },
    { value: "cotton", label: "Cotton", icon: "☁️" },
    { value: "sunflower", label: "Sunflower", icon: "🌻" },
    { value: "canola", label: "Canola", icon: "🌼" },
    { value: "lettuce", label: "Lettuce", icon: "🥬" },
    { value: "carrots", label: "Carrots", icon: "🥕" },
    { value: "onions", label: "Onions", icon: "🧅" },
    { value: "peppers", label: "Peppers", icon: "🌶️" },
    { value: "cucumbers", label: "Cucumbers", icon: "🥒" },
    { value: "peas", label: "Peas", icon: "🟢" },
    { value: "spinach", label: "Spinach", icon: "🥬" },
  ];

  const severityOptions = [
    { value: "all", label: "Priorities" },
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
  ]

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === "all" ||
      (alert.crop && alert.crop.toLowerCase() === selectedCrop);
    const matchesSeverity = selectedSeverity === "all" ||
      (alert.severity && alert.severity.toLowerCase() === selectedSeverity);
    return matchesSearch && matchesCrop && matchesSeverity;
  });

  const handleViewOnMap = (alert: Alert) => {
    setShowMap(true);
    setTimeout(() => {
      setFocusCoordinates({
        lat: alert.latitude,
        lng: alert.longitude
      });
    }, 100);
  };

  return (
    <div className="min-h-screen text-text-primary bg-bg-primary">
      {/* Header */}
      <Header setShowProfile={setShowProfile} />
      <div className="bg-bg-secondary">
        <div className="border-b border-border/25 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2 p-2.5">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search alerts, crops..."
                className="!text-base !pl-10 rounded-full w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center px-3 py-1  space-x-2 bg-transparent hover:bg-transparent flex-1 sm:flex-none border border-border dark:!border-border/25 rounded-full">
                    <span className="text-base">{cropOptions.find(opt => opt.value === selectedCrop)?.label || "Crops"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 bg-bg-primary text-text-primary border border-border/25 rounded-lg">
                  {cropOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedCrop(option.value)}>
                      {option.icon} {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center px-3 py-1 space-x-2 bg-transparent hover:bg-transparent flex-1 sm:flex-none border border-border dark:!border-border/25 rounded-full">
                    <span className="text-base">{severityOptions.find(opt => opt.value === selectedSeverity)?.label || "Priorities"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 bg-bg-primary text-text-primary border border-border/25 rounded-lg">
                  {severityOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setSelectedSeverity(option.value)}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex justify-end items-center px-3 py-1 space-x-2 min-w-fit border border-border dark:!border-border/25 rounded-full">
            <span className="text-base">Map View</span>
            <Switch checked={showMap} onCheckedChange={setShowMap} className="bg-text-muted/25 data-[state=checked]:bg-accent" />
          </div>
        </div>
        {/* Main Content - Split Panel */}
        <div className="flex flex-col lg:flex-row relative h-[calc(100vh-208px)] sm:h-[calc(100vh-122px)]">
          {/* Left Panel - Alerts */}
          <div className={`${!showMap ? "w-full" : "w-full lg:w-2/3"}  h-full bg-bg-primary overflow-y-auto`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-2.5 border-b border-border/25">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-text-secondary">Published Alerts</h2>
                <Badge variant="secondary" className="bg-accent px-1.5 text-primary font-bold">
                  {filteredAlerts.length}
                </Badge>
              </div>
              <Button
                onClick={() => setShowPublishForm(true)}
                className="bg-transparens hover:!bg-accent hover:text-bg-primary flex items-center space-x-2 w-full sm:w-auto justify-center border border-border dark:!border-border/25 rounded-full"
              >
                <span>New Alert</span>
                <CirclePlus className="h-4 w-4" />
              </Button>
            </div>
            {/* Grid of alert cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-2.5">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 col-span-full">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onViewOnMap={handleViewOnMap}
                  />
                ))
              )}
            </div>
          </div>
          {/* Right Panel - Map */}
          {showMap && (
            <div className="w-full h-full lg:w-1/3 absolute lg:relative border-t md:border-t-0 md:border-l min-h-[400px] md:min-h-0">
              <div className="absolute inset-0">
                <EnhancedMap
                  user={user || undefined}
                  alerts={filteredAlerts}
                  focusCoordinates={focusCoordinates}
                />
              </div>
            </div>
          )}
        </div>
        {/* Modals */}
        {showPublishForm && (
          <AlertCreationForm 
            onClose={() => setShowPublishForm(false)} 
            onSuccess={(newAlert) => {
              console.log(">> >> ", newAlert);
              setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
            }}
          />
        )}
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      </div>
    </div>
  )
}