"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { EnhancedMap } from "../enhanced-map"
import { LocationSetupModal } from "@/components/location/location-setup-modal"
import { ProfileModal } from "./profile-modal"
import type { Alert } from "@/types"
// import { userApi } from "@/lib/api"
// Import the new components
// import { WeatherWidget } from "../weather-widget"
// import { QuickActions } from "../quick-actions"
// import { RecentActivity } from "../recent-activity"
import { alertsApi } from "@/lib/api"
import { alertCategories, severityLevels } from "../alerts/alert-creation-form"
// import { AlertMap } from "../alerts/alert-map"
import { Header } from "./Header"

export function FarmerDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCrop, setSelectedCrop] = useState("all")
  // const [savedAlerts, setSavedAlerts] = useState<string[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [activeTab, setActiveTab] = useState("feed")

  const { user, shouldShowLocationSetup, setShouldShowLocationSetup, updateUser } = useAuth()


  const handleLocationUpdated = (updatedUser: any) => {
    updateUser(updatedUser)
  }

  const [alerts, setAlerts] = useState<Alert[]>([
  ])
  const loadAlerts = async () => {
    try {
      if (!user?.latitude || !user?.longitude) return;
      const alerts = await alertsApi.getAlerts(user.latitude, user.longitude, 2000);
      setAlerts(alerts);
    } catch (err) {
      console.error(err)
    }
  }
  useEffect(() => {
    loadAlerts();
  }, [])

  // Add more comprehensive filtering options
  const cropOptions = [
    { value: "all", label: "All Crops" },
    { value: "wheat", label: "Wheat" },
    { value: "corn", label: "Corn" },
    { value: "soybeans", label: "Soybeans" },
    { value: "tomatoes", label: "Tomatoes" },
    { value: "vegetables", label: "Vegetables" },
    { value: "rice", label: "Rice" },
    { value: "cotton", label: "Cotton" },
  ]

  const getSeverity = (item: string) => {
    return severityLevels.find((s) => s.value === item);
  }
  const getCategory = (item: string) => {
    return alertCategories.find((s) => s.value === item);
  }

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

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <Header setShowProfile={setShowProfile} />
      {/* <AlertMap /> */}
      {/* Search and Filters */}
      <div className="p-4 bg-card border-b">
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search alerts, crops, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="flex h-10 w-full sm:w-[25%] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cropOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick filter chips */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedSeverity === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSeverity(selectedSeverity === "high" ? "all" : "high")}
            className="h-7 text-xs"
          >
            🚨 High Priority
          </Button>
          <Button
            variant={selectedSeverity === "low" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSeverity(selectedSeverity === "low" ? "all" : "low")}
            className="h-7 text-xs"
          >
            🟢 Low Priority
          </Button>
          <Button
            variant={selectedSeverity === "medium" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSeverity(selectedSeverity === "medium" ? "all" : "medium")}
            className="h-7 text-xs"
          >
            🟠 Medium Priority
          </Button>
          <Button
            variant={selectedSeverity === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSeverity(selectedSeverity === "critical" ? "all" : "critical")}
            className="h-7 text-xs"
          >
            🔴 Critical Priority
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">

        {/* Existing Tabs content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Alert Feed</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Alerts ({filteredAlerts.length})</h2>
            </div>

            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Card className="w-full  max-h-[90vh] overflow-y-auto" key={alert.id}>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverity(alert.severity)?.color}>{getSeverity(alert.severity)?.label.toUpperCase()}</Badge>
                        <Badge variant="outline" className={getCategory(alert.category)?.color}>
                          {getCategory(alert.category)?.icon} {getCategory(alert.category)?.label}
                        </Badge>
                    </div>
        
                    <h3 className="text-xl font-bold">{alert.title}</h3>
        
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>🌾 {alert.crop}</span>
                      <span>📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                      <span>📏 {alert.radius / 1000}km radius</span>
                    </div>
        
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{alert.description}</p>
                    </div>
        
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Alerts & Your Farm</CardTitle>
                <CardDescription>
                  View alerts in your area and your farm location on the interactive map
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedMap 
                  userRole="Farmer"
                  user={user || undefined}
                  alerts={alerts}
                  onAlertClick={(alert) => console.log('Alert clicked:', alert)}
                  websocketUrl="ws://localhost:8000/ws/alerts/"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Location Setup Modal */}
      {user && (
        <LocationSetupModal
          user={user}
          isOpen={shouldShowLocationSetup}
          onClose={() => setShouldShowLocationSetup(false)}
          onLocationUpdated={handleLocationUpdated}
        />
      )}
      {/* Profile Modal */}
      {(showProfile && user) && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  )
}
