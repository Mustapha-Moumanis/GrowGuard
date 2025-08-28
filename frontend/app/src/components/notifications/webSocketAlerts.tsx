import type { Alert } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  alert_id?: string;
  created_at: string;
  is_read: boolean;
}

interface WebSocketMessage {
  type: string;
  notification?: Notification;
  alert?: Alert;
  message?: string;
  user_id?: string;
  timestamp?: number;
}

interface WebSocketAlertsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

export const webSocketAlerts = (): WebSocketAlertsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data: WebSocketMessage): void => {
    console.log('WebSocket message received:', data);
    
    switch (data.type) {
      case 'connection_established':
        console.log('WebSocket connection established');
        break;
        
      case 'notification':
      case 'send_notification':
        if (data.notification) {
          const notification: Notification = {
            id: data.notification.id || Date.now().toString(),
            title: data.notification.title,
            message: data.notification.message,
            type: data.notification.type || 'alert',
            alert_id: data.notification.alert_id,
            created_at: data.notification.created_at || new Date().toISOString(),
            is_read: data.notification.is_read || false
          };
          setNotifications(prev => [notification, ...prev]);
          
          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icon.png'
            });
          }
        }
        break;
        
      case 'alert_created':
        if (data.alert) {
          const notification: Notification = {
            id: Date.now().toString(),
            title: `New Alert: ${data.alert.title}`,
            message: data.message || 'A new alert has been created',
            type: 'alert_created',
            alert_id: data.alert.id,
            created_at: new Date().toISOString(),
            is_read: false
          };
          setNotifications(prev => [notification, ...prev]);
        }
        break;
        
      case 'pong':
        // Keep-alive response
        break;
        
      case 'error':
        console.error('WebSocket error:', data.message);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  // Attempt to reconnect
  const attemptReconnect = useCallback((): void => {
    if (reconnectTimeoutRef.current) {
      return;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectWebSocket();
    }, 3000);
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback((): void => {
    const token = localStorage.getItem('GrowGuard-access-token');
    
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    try {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close();
      }

      const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';
      const wsUrl = `${baseUrl}/ws/notifications/?token=${encodeURIComponent(token)}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket connection opened successfully');
        
        // Clear any reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      socket.onmessage = (event: MessageEvent) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err, event.data);
        }
      };
      
      socket.onclose = (event: CloseEvent) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Attempt reconnect unless closed intentionally
        if (event.code !== 1000) {
          attemptReconnect();
        }
      };
      
      socket.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
      };
      
      socketRef.current = socket;
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      attemptReconnect();
    }
  }, [handleWebSocketMessage, attemptReconnect]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string): void => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
    
    // Optionally send read status to server
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'mark_read',
        notification_id: notificationId
      }));
    }
  }, []);

  const clearAllNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Initialize connection
  useEffect(() => {
    connectWebSocket();

    // Ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));
      }
    }, 25000);

    return () => {
      // Cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(pingInterval);
      
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connectWebSocket]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAllNotifications
  };
};