import api from './api'
import type { DashboardStats } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get('/api/dashboard/')
  return res.data
}
