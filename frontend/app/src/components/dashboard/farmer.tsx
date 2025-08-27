// "use client"

// import { useState, useEffect } from "react"
// import { useAuth } from "@/hooks/use-auth"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// import { Input } from "@/components/ui/input"
// import { Search } from "lucide-react"
// import { EnhancedMap } from "../enhanced-map"
// import { LocationSetupModal } from "@/components/location/location-setup-modal"
// import { ProfileModal } from "./profile-modal"
// import type { Alert } from "@/types"
// // import { userApi } from "@/lib/api"
// // Import the new components
// // import { WeatherWidget } from "../weather-widget"
// // import { QuickActions } from "../quick-actions"
// // import { RecentActivity } from "../recent-activity"
// import { alertsApi } from "@/lib/api"
// import { alertCategories, severityLevels } from "../alerts/alert-creation-form"
// // import { AlertMap } from "../alerts/alert-map"
// import { Header } from "./Header"

// export function FarmerDashboard() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedCrop, setSelectedCrop] = useState("all")
//   // const [savedAlerts, setSavedAlerts] = useState<string[]>([])
//   const [showProfile, setShowProfile] = useState(false)
//   const [selectedSeverity, setSelectedSeverity] = useState("all")
//   const [activeTab, setActiveTab] = useState("feed")

//   const { user, shouldShowLocationSetup, setShouldShowLocationSetup, updateUser } = useAuth()


//   const handleLocationUpdated = (updatedUser: any) => {
//     updateUser(updatedUser)
//   }

//   const [alerts, setAlerts] = useState<Alert[]>([
//   ])
//   const loadAlerts = async () => {
//     try {
//       if (!user?.latitude || !user?.longitude) return;
//       const alerts = await alertsApi.getAlerts(user.latitude, user.longitude, 2000);
//       setAlerts(alerts);
//     } catch (err) {
//       console.error(err)
//     }
//   }
//   useEffect(() => {
//     loadAlerts();
//   }, [])

//   // Add more comprehensive filtering options
//   const cropOptions = [
//     { value: "all", label: "All Crops" },
//     { value: "wheat", label: "Wheat" },
//     { value: "corn", label: "Corn" },
//     { value: "soybeans", label: "Soybeans" },
//     { value: "tomatoes", label: "Tomatoes" },
//     { value: "vegetables", label: "Vegetables" },
//     { value: "rice", label: "Rice" },
//     { value: "cotton", label: "Cotton" },
//   ]

//   const getSeverity = (item: string) => {
//     return severityLevels.find((s) => s.value === item);
//   }
//   const getCategory = (item: string) => {
//     return alertCategories.find((s) => s.value === item);
//   }

//   const filteredAlerts = alerts.filter((alert) => {
//     const matchesSearch =
//       alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesCrop = selectedCrop === "all" || 
//       (alert.crop && alert.crop.toLowerCase() === selectedCrop);
    
//     const matchesSeverity = selectedSeverity === "all" || 
//       (alert.severity && alert.severity.toLowerCase() === selectedSeverity);
    
//     return matchesSearch && matchesCrop && matchesSeverity;
//   });

//   return (
//     <div className="min-h-screen bg-background transition-colors">
//       {/* Header */}
//       <Header setShowProfile={setShowProfile} />
//       {/* <AlertMap /> */}
//       {/* Search and Filters */}
//       <div className="p-4 bg-card border-b">
//         <div className="flex flex-col sm:flex-row gap-2 mb-3">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//             <Input
//               placeholder="Search alerts, crops, or authors..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <select
//             value={selectedCrop}
//             onChange={(e) => setSelectedCrop(e.target.value)}
//             className="flex h-10 w-full sm:w-[25%] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {cropOptions.map((option) => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Quick filter chips */}
//         <div className="flex gap-2 flex-wrap">
//           <Button
//             variant={selectedSeverity === "high" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setSelectedSeverity(selectedSeverity === "high" ? "all" : "high")}
//             className="h-7 text-xs"
//           >
//             🚨 High Priority
//           </Button>
//           <Button
//             variant={selectedSeverity === "low" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setSelectedSeverity(selectedSeverity === "low" ? "all" : "low")}
//             className="h-7 text-xs"
//           >
//             🟢 Low Priority
//           </Button>
//           <Button
//             variant={selectedSeverity === "medium" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setSelectedSeverity(selectedSeverity === "medium" ? "all" : "medium")}
//             className="h-7 text-xs"
//           >
//             🟠 Medium Priority
//           </Button>
//           <Button
//             variant={selectedSeverity === "critical" ? "default" : "outline"}
//             size="sm"
//             onClick={() => setSelectedSeverity(selectedSeverity === "critical" ? "all" : "critical")}
//             className="h-7 text-xs"
//           >
//             🔴 Critical Priority
//           </Button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="p-4">

//         {/* Existing Tabs content */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="feed">Alert Feed</TabsTrigger>
//             <TabsTrigger value="map">Map View</TabsTrigger>
//           </TabsList>

//           <TabsContent value="feed" className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-semibold">Recent Alerts ({filteredAlerts.length})</h2>
//             </div>

//             <div className="space-y-3">
//               {filteredAlerts.map((alert) => (
//                 <Card className="w-full  max-h-[90vh] overflow-y-auto" key={alert.id}>
//                   <CardContent className="space-y-4">
//                     <div className="flex items-center gap-2">
//                       <Badge className={getSeverity(alert.severity)?.color}>{getSeverity(alert.severity)?.label.toUpperCase()}</Badge>
//                         <Badge variant="outline" className={getCategory(alert.category)?.color}>
//                           {getCategory(alert.category)?.icon} {getCategory(alert.category)?.label}
//                         </Badge>
//                     </div>
        
//                     <h3 className="text-xl font-bold">{alert.title}</h3>
        
//                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                       <span>🌾 {alert.crop}</span>
//                       <span>📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
//                       <span>📏 {alert.radius / 1000}km radius</span>
//                     </div>
        
//                     <div className="prose max-w-none">
//                       <p className="whitespace-pre-wrap">{alert.description}</p>
//                     </div>
        
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </TabsContent>

//           <TabsContent value="map" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Nearby Alerts & Your Farm</CardTitle>
//                 <CardDescription>
//                   View alerts in your area and your farm location on the interactive map
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <EnhancedMap 
//                   user={user || undefined}
//                   alerts={alerts}
//                 />
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//       {/* Location Setup Modal */}
//       {user && (
//         <LocationSetupModal
//           user={user}
//           isOpen={shouldShowLocationSetup}
//           onClose={() => setShouldShowLocationSetup(false)}
//           onLocationUpdated={handleLocationUpdated}
//         />
//       )}
//       {/* Profile Modal */}
//       {(showProfile && user) && <ProfileModal onClose={() => setShowProfile(false)} />}
//     </div>
//   )
// }


"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, AlertTriangle } from "lucide-react"
import { EnhancedMap } from "../enhanced-map"
import { LocationSetupModal } from "@/components/location/location-setup-modal"
import { ProfileModal } from "./profile-modal"
import type { Alert } from "@/types"
import { alertsApi } from "@/lib/api"
import { Header } from "./Header"
import { AlertCard } from "../alerts/alert-card"

export function FarmerDashboard() {
  const [showProfile, setShowProfile] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCrop, setSelectedCrop] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const { user, shouldShowLocationSetup, setShouldShowLocationSetup, updateUser } = useAuth()
  const [focusCoordinates, setFocusCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([])

  const handleLocationUpdated = (updatedUser: any) => {
    updateUser(updatedUser)
  }

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
  }, [user?.latitude, user?.longitude])

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
    { value: "critical", label: "Critical Priority" },
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
                <h2 className="text-lg font-semibold text-text-secondary">Nearby Alerts</h2>
                <Badge variant="secondary" className="bg-accent px-1.5 text-primary font-bold">
                  {filteredAlerts.length}
                </Badge>
              </div>
              {/* No "New Alert" button for farmers - they can't create alerts */}
            </div>
            {/* Grid of alert cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-2.5">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 col-span-full">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {!user?.latitude || !user?.longitude 
                      ? "Please set your location to view nearby alerts."
                      : "No alerts in your area match the current filters."
                    }
                  </p>
                  {(!user?.latitude || !user?.longitude) && (
                    <Button 
                      onClick={() => setShouldShowLocationSetup(true)}
                      className="mt-2"
                    >
                      Set Location
                    </Button>
                  )}
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