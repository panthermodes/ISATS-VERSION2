import { api } from './api'

export const reportService = {
  getSummary: async () => {
    const res = await api.get('/api/reports/summary/')
    return res.data
  },

  exportCSV: async (reportType: 'assets' | 'tickets' | 'maintenance' | 'users') => {
    const res = await api.get(`/api/reports/export/csv/?type=${reportType}`, {
      responseType: 'blob',
    })
    return res.data
  },

  exportPDF: async (reportType: 'assets' | 'tickets' | 'maintenance' | 'users') => {
    const res = await api.get(`/api/reports/export/pdf/?type=${reportType}`, {
      responseType: 'blob',
    })
    return res.data
  },
}
