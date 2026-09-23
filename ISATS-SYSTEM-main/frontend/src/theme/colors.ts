/**
 * ISATS Official Design Tokens — Colors
 * Strict enterprise palette establishing one consistent visual language.
 */

export const ISATS_COLORS = {
  // Primary Interactive
  primary: {
    DEFAULT: '#2563EB', // Electric Blue
    hover:   '#3B82F6',
    active:  '#1D4ED8',
    glow:    'rgba(37, 99, 235, 0.25)',
  },

  // Technical Accent
  accent: {
    cyan:      '#06B6D4',
    cyanHover: '#22D3EE',
    cyanGlow:  'rgba(6, 182, 212, 0.25)',
  },

  // Dark Foundation
  dark: {
    bg:        '#07111F', // Deep Navy application canvas
    surface:   '#0B1728', // Secondary Navy for layouts/sidebars
    card:      '#101D2E', // Elevated Surface for cards & dialogs
    cardHover: '#152438',
    border:    '#1E293B',
    textPrimary:   '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted:     '#64748B',
  },

  // Light Foundation
  light: {
    bg:        '#F8FAFC', // Crisp light page
    surface:   '#F1F5F9', // Secondary light surface
    card:      '#FFFFFF', // Card background
    cardHover: '#F8FAFC',
    border:    '#E2E8F0',
    textPrimary:   '#0F172A',
    textSecondary: '#64748B',
    textMuted:     '#94A3B8',
  },

  // Semantic Status
  semantic: {
    success: {
      DEFAULT: '#10B981', // Emerald — Available / Healthy / Success
      bg:      'rgba(16, 185, 129, 0.12)',
      border:  'rgba(16, 185, 129, 0.25)',
    },
    warning: {
      DEFAULT: '#F59E0B', // Amber — Maintenance / Pending / Warning
      bg:      'rgba(245, 158, 11, 0.12)',
      border:  'rgba(245, 158, 11, 0.25)',
    },
    danger: {
      DEFAULT: '#EF4444', // Red — Critical / Destructive / Error
      bg:      'rgba(239, 68, 68, 0.12)',
      border:  'rgba(239, 68, 68, 0.25)',
    },
    info: {
      DEFAULT: '#06B6D4', // Cyan — Informational
      bg:      'rgba(6, 182, 212, 0.12)',
      border:  'rgba(6, 182, 212, 0.25)',
    },
    assigned: {
      DEFAULT: '#2563EB', // Electric Blue — In active use / Assigned
      bg:      'rgba(37, 99, 235, 0.12)',
      border:  'rgba(37, 99, 235, 0.25)',
    },
    retired: {
      DEFAULT: '#64748B', // Slate — Retired / Disabled / Decommissioned
      bg:      'rgba(100, 116, 139, 0.12)',
      border:  'rgba(100, 116, 139, 0.25)',
    },
  },

  // Category Colors (for ICT Device Badges, Icons, and Charts)
  categories: {
    computing:     '#3B82F6',
    networking:    '#06B6D4',
    pos:           '#8B5CF6',
    security:      '#F59E0B',
    printing:      '#64748B',
    power:         '#10B981',
    communication: '#14B8A6',
    storage:       '#6366F1',
    datacenter:    '#0EA5E9',
    infrastructure:'#8B5CF6',
    other:         '#64748B',
  },
} as const

export type DeviceCategoryKey = keyof typeof ISATS_COLORS.categories

export function getCategoryColor(slugOrName: string): string {
  const norm = slugOrName.toLowerCase().replace(/[\s-_]/g, '')
  if (norm.includes('comput')) return ISATS_COLORS.categories.computing
  if (norm.includes('network')) return ISATS_COLORS.categories.networking
  if (norm.includes('pos') || norm.includes('pointofsale')) return ISATS_COLORS.categories.pos
  if (norm.includes('secur') || norm.includes('surveill')) return ISATS_COLORS.categories.security
  if (norm.includes('print') || norm.includes('scan')) return ISATS_COLORS.categories.printing
  if (norm.includes('power') || norm.includes('ups') || norm.includes('energy')) return ISATS_COLORS.categories.power
  if (norm.includes('tele') || norm.includes('comm') || norm.includes('phone') || norm.includes('voip')) return ISATS_COLORS.categories.communication
  if (norm.includes('storage') || norm.includes('nas') || norm.includes('san')) return ISATS_COLORS.categories.storage
  if (norm.includes('data') || norm.includes('server') || norm.includes('rack')) return ISATS_COLORS.categories.datacenter
  if (norm.includes('infra')) return ISATS_COLORS.categories.infrastructure
  return ISATS_COLORS.categories.other
}
