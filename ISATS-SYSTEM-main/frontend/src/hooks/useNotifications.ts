import { useState, useEffect, useCallback } from 'react'
import { getNotifications, markAsRead as apiMarkRead, markAllRead as apiMarkAllRead } from '@/services/notifications'
import type { Notification } from '@/types'

const POLL_INTERVAL = 30_000

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetch])

  const markRead = async (id: number) => {
    await apiMarkRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    await apiMarkAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
    loading,
    markRead,
    markAllRead,
    refetch: fetch,
  }
}
