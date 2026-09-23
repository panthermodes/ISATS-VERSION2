import { formatDistanceToNow, format, parseISO } from 'date-fns'
import type { UserRole } from '@/types'

export function formatDate(date?: string | null): string {
  if (!date) return '—'
  try { return format(parseISO(date), 'MMM d, yyyy') } catch { return date }
}

export function formatDateTime(date?: string | null): string {
  if (!date) return '—'
  try { return format(parseISO(date), 'MMM d, yyyy, hh:mm a') } catch { return date }
}

export function formatRelativeTime(date?: string | null): string {
  if (!date) return '—'
  try { return formatDistanceToNow(parseISO(date), { addSuffix: true }) } catch { return date }
}

export function formatCurrency(amount: number, currency = 'TZS'): string {
  return `${currency} ${amount.toLocaleString('en-TZ')}`
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}…` : str
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'purple'

export function getRoleBadgeVariant(role?: string | null): BadgeVariant {
  if (!role) return 'neutral'
  const map: Record<string, BadgeVariant> = {
    'User': 'neutral',
    'ICT Officer': 'info',
    'Manager': 'primary',
    'Admin': 'warning',
    'SuperAdmin': 'danger',
  }
  return map[role] ?? 'neutral'
}

export function getStatusBadgeVariant(status?: string | null): BadgeVariant {
  if (!status) return 'neutral'
  const map: Record<string, BadgeVariant> = {
    'Active': 'success', 'active': 'success',
    'Inactive': 'neutral', 'inactive': 'neutral',
    'Maintenance': 'warning', 'maintenance': 'warning',
    'Disposed': 'danger', 'disposed': 'danger',
    'Open': 'info', 'open': 'info',
    'In Progress': 'warning', 'in_progress': 'warning',
    'Resolved': 'success', 'resolved': 'success',
    'Closed': 'neutral', 'closed': 'neutral',
    'Pending': 'warning', 'pending': 'warning',
    'Approved': 'success', 'approved': 'success',
    'Rejected': 'danger', 'rejected': 'danger',
  }
  return map[status] ?? 'neutral'
}

export function getPriorityBadgeVariant(priority?: string | null): BadgeVariant {
  if (!priority) return 'neutral'
  const map: Record<string, BadgeVariant> = {
    'Low': 'success', 'low': 'success',
    'Medium': 'warning', 'medium': 'warning',
    'High': 'danger', 'high': 'danger',
    'Critical': 'danger', 'critical': 'danger',
    'Urgent': 'danger', 'urgent': 'danger',
  }
  return map[priority] ?? 'neutral'
}
