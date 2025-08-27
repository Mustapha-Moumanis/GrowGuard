// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Bell, Clock, X, CheckCircle, AlertTriangle, Info, MessageSquare } from "lucide-react"
// import { webSocketAlerts } from "./webSocketAlerts"

// export function NotificationBell() {
//   const [isOpen, setIsOpen] = useState(false)
  
//   const { 
//     notifications, 
//     unreadCount, 
//     markAsRead, 
//     clearAllNotifications,
//     isConnected,
//     reconnect,
//   } = webSocketAlerts()

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case "pest_alert":
//       case "disease_alert":
//         return <AlertTriangle className="w-4 h-4 text-red-500" />
//       case "weather_alert":
//         return <Info className="w-4 h-4 text-blue-500" />
//       case "response":
//         return <MessageSquare className="w-4 h-4 text-purple-500" />
//       case "system":
//         return <CheckCircle className="w-4 h-4 text-green-500" />
//       default:
//         return <Bell className="w-4 h-4 text-gray-500" />
//     }
//   }

//   const getNotificationBg = (type: string, isRead: boolean) => {
//     if (isRead) return ""
    
//     switch (type) {
//       case "pest_alert":
//       case "disease_alert":
//         return "bg-red-50 dark:bg-red-950/50 border-l-4 border-l-red-500"
//       case "weather_alert":
//         return "bg-blue-50 dark:bg-blue-950/50 border-l-4 border-l-blue-500"
//       case "response":
//         return "bg-purple-50 dark:bg-purple-950/50 border-l-4 border-l-purple-500"
//       case "system":
//         return "bg-green-50 dark:bg-green-950/50 border-l-4 border-l-green-500"
//       default:
//         return "bg-gray-50 dark:bg-gray-950/50 border-l-4 border-l-gray-500"
//     }
//   }

//   const formatTimeAgo = (dateString: string) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
//     if (diffInSeconds < 60) return `${diffInSeconds}s ago`
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
//     return `${Math.floor(diffInSeconds / 86400)}d ago`
//   }

//   const getTitle = (alert: any) => {
//     if (!alert) return "Notification"
    
//     switch (alert.type) {
//       case "pest_alert": return "Pest Alert"
//       case "disease_alert": return "Disease Alert"
//       case "weather_alert": return "Weather Alert"
//       case "system": return "System Notification"
//       default: return "Alert"
//     }
//   }

//   const handleNotificationClick = (notification: any) => {
//     if (!notification.read) {
//       markAsRead(notification.id)
//     }
    
//     if (notification.alert?.id) {
//       console.log("Navigate to:", `/alerts/${notification.alert.id}`)
//     }
//   }

//   const handleMarkAllAsRead = () => {
//     notifications
//       .filter(n => !n.read)
//       .forEach(n => markAsRead(n.id))
//   }

//   return (
//     <div className="relative">
//       <Button 
//         variant="ghost" 
//         size="icon" 
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative hover:bg-accent"
//       >
//         <Bell className="w-4 h-4" />
//         {unreadCount > 0 && (
//           <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
//             {unreadCount > 9 ? "9+" : unreadCount}
//           </Badge>
//         )}
//       </Button>

//       {isOpen && (
//         <>
//           <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
//           <Card className="bg-bg-primary text-text-primary absolute right-0 top-12 w-80 z-50 shadow-lg">
//             <CardHeader className="border-b pb-3">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle className="text-base">Notifications</CardTitle>
//                   <CardDescription>
//                     {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
//                   </CardDescription>
//                 </div>
//                 <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
//                   <X className="w-4 h-4" />
//                 </Button>
//               </div>
//             </CardHeader>

//             <CardContent className="p-0">
//               <div className="max-h-80 overflow-y-auto">
//                 {notifications.length === 0 ? (
//                   <div className="p-8 text-center text-muted-foreground">
//                     <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
//                     <p>No notifications yet</p>
//                   </div>
//                 ) : (
//                   notifications.map((notification) => (
//                     <div
//                       key={notification.id}
//                       className={`
//                         p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors
//                         ${getNotificationBg(notification.alert?.type, notification.read)}
//                       `}
//                       onClick={() => handleNotificationClick(notification)}
//                     >
//                       <div className="flex items-start gap-3">
//                         <div className="flex-shrink-0 mt-1">
//                           {getNotificationIcon(notification.alert?.type)}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-start justify-between gap-2 mb-1">
//                             <h4 className={`font-medium text-sm line-clamp-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
//                               {getTitle(notification.alert)}
//                               {notification.alert?.severity && (
//                                 <Badge variant="outline" className="ml-2 text-xs">
//                                   {notification.alert.severity.toUpperCase()}
//                                 </Badge>
//                               )}
//                             </h4>
//                             {!notification.read && (
//                               <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
//                             )}
//                           </div>
//                           <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
//                             {notification.alert?.message || "New notification"}
//                           </p>
//                           <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                             <Clock className="w-3 h-3" />
//                             {formatTimeAgo(notification.alert?.timestamp || notification.createdAt || new Date().toISOString())}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>

//               {notifications.length > 0 && (
//                 <div className="p-3 border-t bg-muted/20">
//                   <div className="flex gap-2">
//                     <Button 
//                       variant="ghost" 
//                       size="sm"
//                       className="flex-1"
//                       onClick={handleMarkAllAsRead}
//                       disabled={unreadCount === 0}
//                     >
//                       Mark All Read
//                     </Button>
//                     <Button 
//                       variant="ghost" 
//                       size="sm"
//                       className="flex-1"
//                       onClick={clearAllNotifications}
//                     >
//                       Clear All
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   )
// }


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Clock, X, CheckCircle, AlertTriangle, Info, MessageSquare } from "lucide-react"
import { webSocketAlerts } from "./webSocketAlerts"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    clearAllNotifications,
  } = webSocketAlerts()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert_created":
      case "alert_nearby":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "weather_alert":
        return <Info className="w-4 h-4 text-blue-500" />
      case "response":
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      case "system":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationBg = (type: string, isRead: boolean) => {
    if (isRead) return ""
    
    switch (type) {
      case "alert_created":
      case "alert_nearby":
        return "bg-red-50 dark:bg-red-950/50 border-l-4 border-l-red-500"
      case "weather_alert":
        return "bg-blue-50 dark:bg-blue-950/50 border-l-4 border-l-blue-500"
      case "response":
        return "bg-purple-50 dark:bg-purple-950/50 border-l-4 border-l-purple-500"
      case "system":
        return "bg-green-50 dark:bg-green-950/50 border-l-4 border-l-green-500"
      default:
        return "bg-gray-50 dark:bg-gray-950/50 border-l-4 border-l-gray-500"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Just now"
      
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return `${diffInSeconds}s ago`
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      return `${Math.floor(diffInSeconds / 86400)}d ago`
    } catch {
      return "Just now"
    }
  }

  const getTitle = (notification: any) => {
    if (!notification) return "Notification"
    
    switch (notification.type) {
      case "alert_created": return "Alert Created"
      case "alert_nearby": return "Nearby Alert"
      case "weather_alert": return "Weather Alert"
      case "system": return "System Notification"
      default: return notification.title || "Notification"
    }
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    
    if (notification.alert_id) {
      console.log("Navigate to:", `/alerts/${notification.alert_id}`)
      // You can add navigation logic here
      // router.push(`/alerts/${notification.alert_id}`)
    }
    
    setIsOpen(false)
  }

  const handleMarkAllAsRead = () => {
    notifications
      .filter(n => !n.is_read)
      .forEach(n => markAsRead(n.id))
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-accent"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          <Card className="bg-bg-primary text-text-primary absolute right-0 top-12 w-80 z-50 shadow-lg border">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <CardDescription>
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors
                        ${getNotificationBg(notification.type, notification.is_read)}
                        ${!notification.is_read ? 'bg-muted/30' : ''}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-medium text-sm line-clamp-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {getTitle(notification)}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message || "New notification"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t bg-muted/20">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-1"
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      Mark All Read
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-1"
                      onClick={clearAllNotifications}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}