import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../store/useToastStore'
import { apiFetch } from '../api/apiClient'
import { io, Socket } from 'socket.io-client'

export interface NotificationItem {
  _id: string
  type: 'follow' | 'rating' | 'comment' | 'collab_request' | 'collab_accepted'
  message: string
  isRead: boolean
  createdAt: string
  fromUser?: {
    _id: string
    name: string
    firstName?: string
    avatarUrl?: string
    role?: string
  }
  relatedStory?: {
    _id: string
    title: string
    shareSlug?: string
  }
}

export function useSocketNotifications() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const socketRef = useRef<Socket | null>(null)

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await apiFetch('/api/notifications')
      const json = await res.json()
      if (res.ok && json.success) {
        setNotifications(json.data || [])
        setUnreadCount(json.unreadCount || 0)
      }
    } catch {
      // silent catch
    }
  }, [isAuthenticated])

  // Mark single as read
  const markAsRead = async (id: string) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      const json = await res.json()
      if (res.ok && json.success) {
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
        setUnreadCount(json.unreadCount ?? Math.max(0, unreadCount - 1))
      }
    } catch {
      // silent catch
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await apiFetch('/api/notifications/read-all', { method: 'PATCH' })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read.')
      }
    } catch {
      // silent catch
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    let isMounted = true
    apiFetch('/api/notifications')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setNotifications(json.data || [])
          setUnreadCount(json.unreadCount || 0)
        }
      })
      .catch(() => {})

    // Initialize socket connection
    const socketInstance = io(window.location.origin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      socketInstance.emit('register_user', user._id)
    })

    socketInstance.on('new_notification', (newNotif: NotificationItem) => {
      setNotifications((prev) => [newNotif, ...prev])
      setUnreadCount((count) => count + 1)
      toast.info(`🔔 ${newNotif.message}`)
    })

    socketRef.current = socketInstance

    return () => {
      isMounted = false
      socketInstance.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, user?._id, fetchNotifications])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetchNotifications: fetchNotifications,
  }
}
