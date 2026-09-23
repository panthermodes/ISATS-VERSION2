import { api } from './api'

export interface BillingBreakdown {
  active_users: number
  included_users: number
  additional_users: number
  base_monthly_price: number
  additional_user_monthly_price: number
  total_monthly_amount: number
  currency: string
}

export interface SubscriptionInfo {
  organization_name: string
  plan_name: string
  status: string
  active_users: number
  included_users: number
  monthly_price: number
  billing_breakdown: BillingBreakdown
  current_period_end: string
}

export interface Invoice {
  id: string
  invoice_number: string
  amount: number
  currency: string
  status: string
  due_date: string
  paid_at: string | null
  created_at: string
}

export const subscriptionService = {
  getSubscription: async (): Promise<SubscriptionInfo> => {
    const res = await api.get('/api/subscription/')
    return res.data
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const res = await api.get('/api/subscription/invoices/')
    return res.data
  },

  initiatePayment: async (data: {
    invoice_id: string
    payment_method: 'MPESA' | 'TIGOPESA' | 'CARD' | 'BANK_TRANSFER'
    phone_number?: string
  }) => {
    const res = await api.post('/api/payments/initiate/', data)
    return res.data
  },
}
