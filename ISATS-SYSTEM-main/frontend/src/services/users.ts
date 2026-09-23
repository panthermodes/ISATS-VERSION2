import api from './api'
import type { User, PaginatedResponse } from '@/types'

export async function getUsers(params?: {
  search?: string
  role?: string
  department?: number
  page?: number
}): Promise<PaginatedResponse<User>> {
  const res = await api.get('/api/users/', { params })
  return res.data
}

export async function getUser(id: number): Promise<User> {
  const res = await api.get(`/api/users/${id}/`)
  return res.data
}

export async function updateUser(
  id: number,
  data: Partial<User>
): Promise<User> {
  const res = await api.patch(`/api/users/${id}/`, data)
  return res.data
}

export async function promoteUser(id: number, role: string): Promise<User> {
  const res = await api.post(`/api/users/${id}/promote/`, { role })
  return res.data
}

export async function demoteUser(id: number): Promise<User> {
  const res = await api.post(`/api/users/${id}/demote/`)
  return res.data
}
