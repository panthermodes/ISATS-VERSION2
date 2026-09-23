import api from './api'
import type { Department } from '@/types'

export async function getDepartments(): Promise<Department[]> {
  const res = await api.get('/api/departments/')
  return Array.isArray(res.data) ? res.data : res.data.results ?? []
}

export async function createDepartment(
  data: Partial<Department>
): Promise<Department> {
  const res = await api.post('/api/departments/', data)
  return res.data
}

export async function updateDepartment(
  id: number,
  data: Partial<Department>
): Promise<Department> {
  const res = await api.patch(`/api/departments/${id}/`, data)
  return res.data
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/api/departments/${id}/`)
}
