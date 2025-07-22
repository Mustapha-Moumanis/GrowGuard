"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Clock, X, CheckCircle, AlertTriangle, Info, MessageSquare } from "lucide-react"
import type { Notification } from "@/types"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Critical Pest Alert",
      message: "Aphid infestation detected 2.3km from your location",
      type: "alert",
      alertId: "alert-123",
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
      severity: "critical",
      actionUrl: "/alerts/alert-123",
      isNew: true,
    },
    {
      id: "2",
      title: "Weather Update",
      message: "Optimal planting conditions expected tomorrow",
      type: "weather",
      isRead: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      severity: "medium",
      isNew: true,
    },
    {
      id: "3",
      title: "Response to Your Alert",
      message: "Local farmer responded to your fungal disease alert",
      type: "response",
      alertId: "alert-456",
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      severity: "low",
      actionUrl: "/alerts/alert-456",
      isNew: false,
    },
    {
      id: "4",
      title: "High Severity Frost Warning",
      message: "Temperature dropping to -2°C tonight. Protect sensitive crops.",
      type: "alert",
      alertId: "alert-789",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      severity: "high",
      actionUrl: "/alerts/alert-789",
      isNew: false,
    },
    {
      id: "5",
      title: "Profile Updated",
      message: "Your profile information has been successfully updated",
      type: "system",
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      severity: "low",
      isNew: false,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getNotificationIcon = (type: string, severity?: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className={`w-4 h-4 ${getSeverityColor(severity)}`} />
      case "weather":
        return <Info className="w-4 h-4 text-blue-500" />
      case "response":
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      case "system":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600"
      case "high":
        return "text-red-500"
      case "medium":
        return "text-orange-500"
      case "low":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const getNotificationColor = (type: string, severity?: string, isRead?: boolean) => {
    if (isRead) return ""

    switch (type) {
      case "alert":
        switch (severity) {
          case "critical":
            return "bg-red-50 dark:bg-red-950/50 border-l-4 border-l-red-600"
          case "high":
            return "bg-red-50 dark:bg-red-950/50 border-l-4 border-l-red-500"
          case "medium":
            return "bg-orange-50 dark:bg-orange-950/50 border-l-4 border-l-orange-500"
          case "low":
            return "bg-yellow-50 dark:bg-yellow-950/50 border-l-4 border-l-yellow-500"
          default:
            return "bg-red-50 dark:bg-red-950/50 border-l-4 border-l-red-500"
        }
      case "weather":
        return "bg-blue-50 dark:bg-blue-950/50 border-l-4 border-l-blue-500"
      case "response":
        return "bg-purple-50 dark:bg-purple-950/50 border-l-4 border-l-purple-500"
      case "system":
        return "bg-green-50 dark:bg-green-950/50 border-l-4 border-l-green-500"
      default:
        return "bg-gray-50 dark:bg-gray-950/50"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev: any[]) =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true, isNew: false }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev: any[]) =>
      prev.map(notification => ({
        ...notification,
        isRead: true,
        isNew: false
      }))
    )
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    // Handle navigation based on actionUrl
    if (notification.actionUrl) {
      console.log("Navigate to:", notification.actionUrl)
      // window.location.href = notification.actionUrl
    }
    
    console.log("Notification clicked:", notification.id)
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />

          <Card className="absolute right-0 top-12 w-80 z-50 shadow-xl">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <CardDescription>
                    {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "All caught up!"}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-80 md:max-h-64 overflow-y-auto">
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
                        ${getNotificationColor(notification.type, notification.severity, notification.isRead)}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-medium text-sm line-clamp-1 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                              {notification.severity && notification.type === "alert" && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {notification.severity.toUpperCase()}
                                </Badge>
                              )}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t bg-muted/30">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-sm h-8" 
                      size="sm"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      Mark All Read
                    </Button>
                    <Button variant="ghost" className="flex-1 text-sm h-8" size="sm">
                      View All
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