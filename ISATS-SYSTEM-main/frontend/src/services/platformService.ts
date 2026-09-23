import { api } from './api'

export interface PlatformStats {
  total_organizations: number
  active_organizations: number
  total_users: number
  total_assets: number
  mrr_tzs: number
  arr_tzs: number
  pending_payments: number
}

export interface PlatformOrg {
  id: string
  legal_name: string
  org_code: string
  industry: string
  country: string
  active_users: number
  included_users: number
  status: string
  created_at: string
}

export const platformService = {
  getStats: async (): Promise<PlatformStats> => {
    const res = await api.get('/api/platform/stats/')
    return res.data
  },

  getOrganizations: async (): Promise<PlatformOrg[]> => {
    const res = await api.get('/api/platform/organizations/')
    return res.data
  },

  suspendOrg: async (orgId: string, reason: string) => {
    const res = await api.post(`/api/platform/organizations/${orgId}/suspend/`, { reason })
    return res.data
  },

  reactivateOrg: async (orgId: string) => {
    const res = await api.post(`/api/platform/organizations/${orgId}/reactivate/`)
    return res.data
  },

  getPlans: async () => {
    const res = await api.get('/api/platform/plans/')
    return res.data
  },

  getPayments: async () => {
    const res = await api.get('/api/platform/payments/')
    return res.data
  },

  confirmPayment: async (paymentId: string) => {
    const res = await api.post(`/api/platform/payments/${paymentId}/confirm/`)
    return res.data
  },
}
