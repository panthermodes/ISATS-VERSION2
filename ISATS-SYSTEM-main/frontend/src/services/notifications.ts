import api from './api'
import type { Notification } from '@/types'

export async function getNotifications(): Promise<Notification[]> {
  const res = await api.get('/api/notifications/')
  return Array.isArray(res.data) ? res.data : res.data.results ?? []
}

export async function markAsRead(id: number): Promise<void> {
  await api.patch(`/api/notifications/${id}/`, { is_read: true })
}

export async function markAllRead(): Promise<void> {
  await api.post('/api/notifications/mark-all-read/')
}
