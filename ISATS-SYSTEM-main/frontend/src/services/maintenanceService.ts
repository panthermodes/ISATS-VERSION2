import { api } from './api'

export interface MaintenanceLog {
  id: number
  asset_tag: string
  maintenance_type: 'Preventive' | 'Corrective' | 'Predictive'
  performed_by: string
  date: string
  notes: string
  parts_replaced?: string
}

export interface PredictiveAlert {
  id: number
  asset_id: string
  asset_tag: string
  risk_score: number
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical'
  recommended_action: string
  predicted_failure_component: string
  days_until_expected_failure: number
}

export const maintenanceService = {
  getLogs: async (): Promise<MaintenanceLog[]> => {
    const res = await api.get('/api/maintenance/logs/')
    return res.data
  },

  createLog: async (data: Partial<MaintenanceLog>) => {
    const res = await api.post('/api/maintenance/logs/', data)
    return res.data
  },

  getPredictiveAlerts: async (): Promise<PredictiveAlert[]> => {
    const res = await api.get('/api/maintenance/predictive/')
    return res.data
  },
}
