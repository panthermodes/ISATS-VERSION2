import api from './api'
import type { InventoryItem } from '@/types'

export async function getInventory(): Promise<InventoryItem[]> {
  const res = await api.get('/api/inventory/')
  return Array.isArray(res.data) ? res.data : res.data.results ?? []
}

export async function createInventoryItem(
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  const res = await api.post('/api/inventory/', data)
  return res.data
}

export async function updateInventoryItem(
  id: number,
  data: Partial<InventoryItem>
): Promise<InventoryItem> {
  const res = await api.patch(`/api/inventory/${id}/`, data)
  return res.data
}

export async function deleteInventoryItem(id: number): Promise<void> {
  await api.delete(`/api/inventory/${id}/`)
}
