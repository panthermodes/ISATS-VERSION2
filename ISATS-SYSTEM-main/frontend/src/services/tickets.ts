import api from './api'
import type { Ticket, PaginatedResponse } from '@/types'

export interface TicketFilters {
  search?: string
  status?: string
  priority?: string
  category?: string | number
  assigned_to?: number
  page?: number
}

export async function getTickets(
  params?: TicketFilters
): Promise<PaginatedResponse<Ticket>> {
  const res = await api.get('/api/tickets/', { params })
  return res.data
}

export async function getTicket(id: number): Promise<Ticket> {
  const res = await api.get(`/api/tickets/${id}/`)
  return res.data
}

export async function createTicket(data: Partial<Ticket>): Promise<Ticket> {
  const res = await api.post('/api/tickets/', data)
  return res.data
}

export async function updateTicket(
  id: number,
  data: Partial<Ticket>
): Promise<Ticket> {
  const res = await api.patch(`/api/tickets/${id}/`, data)
  return res.data
}

export async function assignTicket(
  id: number,
  officerId: number
): Promise<Ticket> {
  const res = await api.post(`/api/tickets/${id}/assign/`, {
    officer_id: officerId,
  })
  return res.data
}

export async function closeTicket(id: number): Promise<Ticket> {
  const res = await api.post(`/api/tickets/${id}/close/`)
  return res.data
}

export async function addComment(
  ticketId: number,
  content: string
): Promise<void> {
  await api.post(`/api/tickets/${ticketId}/comments/`, { content })
}
