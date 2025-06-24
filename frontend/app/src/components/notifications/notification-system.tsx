"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
// import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, BellRing, Settings, X, Check, Clock, Smartphone, Mail, Moon } from "lucide-react"
import { toast } from "sonner"
import type { Notification, UserPreferences } from "@/types"

interface NotificationSystemProps {
  user: any
  onPreferencesUpdate?: (preferences: UserPreferences) => void
}

export function NotificationSystem({ user, onPreferencesUpdate }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      browser: true,
      email: true,
      sms: false,
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "07:00",
      },
    },
    alerts: {
      radius: 25000,
      cropTypes: [],
      severityThreshold: "medium",
      categories: [],
    },
    display: {
      theme: "system",
      language: "en",
      mapType: "roadmap",
    },
  })

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notification-preferences")
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
  }, [])

  // Request notification permission
  useEffect(() => {
    if (preferences.notifications.browser && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
            toast.error("Browser notifications disabled", {
              description: "Enable notifications in your browser settings to receive alerts.",
            })
          }
        })
      }
    }
  }, [preferences.notifications.browser])

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "Critical Alert: Aphid Outbreak",
        message: "New critical alert published 2km from your location",
        time: "2 minutes ago",
        isNew: true,
        type: "alert",
        alertId: "alert-1",
      },
      {
        id: "2",
        title: "Weather Warning",
        message: "Heavy rain expected in your area tomorrow",
        time: "1 hour ago",
        isNew: true,
        type: "weather",
      },
      {
        id: "3",
        title: "Response to Your Alert",
        message: "John Farmer responded to your wheat disease alert",
        time: "3 hours ago",
        isNew: false,
        type: "response",
        alertId: "alert-2",
      },
      {
        id: "4",
        title: "System Update",
        message: "CropAlert has been updated with new features",
        time: "1 day ago",
        isNew: false,
        type: "system",
      },
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => n.isNew).length)
  }, [])

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    localStorage.setItem("notification-preferences", JSON.stringify(newPreferences))
    onPreferencesUpdate?.(newPreferences)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isNew: false } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })))
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    setUnreadCount((prev) => {
      const notification = notifications.find((n) => n.id === notificationId)
      return notification?.isNew ? Math.max(0, prev - 1) : prev
    })
  }

  const sendTestNotification = () => {
    if (preferences.notifications.browser && "Notification" in window && Notification.permission === "granted") {
      new Notification("CropAlert Test", {
        body: "This is a test notification from CropAlert",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    }
    toast.success("Test notification sent!")
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return "🚨"
      case "weather":
        return "🌦️"
      case "response":
        return "💬"
      case "system":
        return "⚙️"
      default:
        return "📢"
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button variant="ghost" size="icon" className="relative" onClick={() => setShowSettings(!showSettings)}>
        {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {showSettings && (
        <div className="absolute right-0 top-12 w-96 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      notification.isNew ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4
                            className={`text-sm font-medium ${notification.isNew ? "text-blue-700 dark:text-blue-300" : ""}`}
                          >
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 opacity-50 hover:opacity-100"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.time}
                          </span>
                          {notification.isNew && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs h-6"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(false)} className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Notification Settings
            </Button>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Customize how you receive alerts and updates</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Notification Channels */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Channels</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <div>
                        <Label>Browser Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get instant alerts in your browser</p>
                      </div>
                    </div>
                    {/*<Switch
                      checked={preferences.notifications.browser}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: { ...preferences.notifications, browser: checked },
                        })
                      }
                    />*/}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" />
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive daily digest emails</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: { ...preferences.notifications, email: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <div>
                        <Label>SMS Alerts (Premium)</Label>
                        <p className="text-sm text-muted-foreground">Critical alerts via text message</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.notifications.sms}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: { ...preferences.notifications, sms: checked },
                        })
                      }
                    />
                  </div>
                </div>

                <Button variant="outline" onClick={sendTestNotification}>
                  Send Test Notification
                </Button>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quiet Hours</h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5" />
                    <div>
                      <Label>Enable Quiet Hours</Label>
                      <p className="text-sm text-muted-foreground">Pause non-critical notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        notifications: {
                          ...preferences.notifications,
                          quietHours: { ...preferences.notifications.quietHours, enabled: checked },
                        },
                      })
                    }
                  />
                </div>

                {preferences.notifications.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-8">
                    <div>
                      <Label>Start Time</Label>
                      <Select
                        value={preferences.notifications.quietHours.start}
                        onValueChange={(value) =>
                          updatePreferences({
                            notifications: {
                              ...preferences.notifications,
                              quietHours: { ...preferences.notifications.quietHours, start: value },
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, "0")
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Select
                        value={preferences.notifications.quietHours.end}
                        onValueChange={(value) =>
                          updatePreferences({
                            notifications: {
                              ...preferences.notifications,
                              quietHours: { ...preferences.notifications.quietHours, end: value },
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, "0")
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Alert Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Alert Preferences</h3>

                <div className="space-y-4">
                  <div>
                    <Label>Notification Radius: {preferences.alerts.radius / 1000}km</Label>
                    {/*Slider
                      value={[preferences.alerts.radius]}
                      onValueChange={([value]) =>
                        updatePreferences({
                          alerts: { ...preferences.alerts, radius: value },
                        })
                      }
                      max={100000}
                      min={1000}
                      step={1000}
                      className="mt-2"
                    />*/}
                  </div>

                  <div>
                    <Label>Minimum Severity</Label>
                    <Select
                      value={preferences.alerts.severityThreshold}
                      onValueChange={(value) =>
                        updatePreferences({
                          alerts: { ...preferences.alerts, severityThreshold: value },
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low and above</SelectItem>
                        <SelectItem value="medium">Medium and above</SelectItem>
                        <SelectItem value="high">High and above</SelectItem>
                        <SelectItem value="critical">Critical only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
