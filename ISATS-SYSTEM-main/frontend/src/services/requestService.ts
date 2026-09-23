import { api } from './api'

export interface AssetRequest {
  id: number
  requester_username: string
  department_name: string
  hardware_type: string
  model_preference?: string
  urgency: 'normal' | 'high' | 'urgent'
  justification: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled'
  created_at: string
}

export const requestService = {
  getRequests: async (): Promise<AssetRequest[]> => {
    const res = await api.get('/api/requests/')
    return res.data
  },

  createRequest: async (data: Partial<AssetRequest>) => {
    const res = await api.post('/api/requests/', data)
    return res.data
  },

  approveRequest: async (id: number) => {
    const res = await api.post(`/api/requests/${id}/approve/`)
    return res.data
  },

  rejectRequest: async (id: number, reason: string) => {
    const res = await api.post(`/api/requests/${id}/reject/`, { reason })
    return res.data
  },
}
