import api from './api'
import type { Category } from '@/types'

export async function getCategories(): Promise<Category[]> {
  const res = await api.get('/api/categories/')
  return Array.isArray(res.data) ? res.data : res.data.results ?? []
}

export async function createCategory(
  data: Partial<Category>
): Promise<Category> {
  const res = await api.post('/api/categories/', data)
  return res.data
}

export async function updateCategory(
  id: number,
  data: Partial<Category>
): Promise<Category> {
  const res = await api.patch(`/api/categories/${id}/`, data)
  return res.data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/api/categories/${id}/`)
}
