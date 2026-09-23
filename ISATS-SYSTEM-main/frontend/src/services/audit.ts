import api from './api'
import type { AuditLog, PaginatedResponse } from '@/types'

export async function getAuditLogs(params?: {
  user?: number
  action?: string
  page?: number
}): Promise<PaginatedResponse<AuditLog>> {
  const res = await api.get('/api/audit/', { params })
  return res.data
}

export async function getAuditLog(id: number): Promise<AuditLog> {
  const res = await api.get(`/api/audit/${id}/`)
  return res.data
}
