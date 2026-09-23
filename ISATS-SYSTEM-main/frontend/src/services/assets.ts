import api from './api'
import type { Asset, PaginatedResponse } from '@/types'

export interface AssetFilters {
  search?: string
  status?: string
  category?: string | number
  department?: string | number
  asset_type?: string
  page?: number
}

export async function getAssets(
  params?: AssetFilters
): Promise<PaginatedResponse<Asset>> {
  const res = await api.get('/api/assets/', { params })
  return res.data
}

export async function getAsset(id: string): Promise<Asset> {
  const res = await api.get(`/api/assets/${id}/`)
  return res.data
}

export async function createAsset(data: Partial<Asset>): Promise<Asset> {
  const res = await api.post('/api/assets/', data)
  return res.data
}

export async function updateAsset(
  id: string,
  data: Partial<Asset>
): Promise<Asset> {
  const res = await api.patch(`/api/assets/${id}/`, data)
  return res.data
}

export async function deleteAsset(id: string): Promise<void> {
  await api.delete(`/api/assets/${id}/`)
}

export async function getAssetReport() {
  const res = await api.get('/api/reports/asset/')
  return res.data
}
