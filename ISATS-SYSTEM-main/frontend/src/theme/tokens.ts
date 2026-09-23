/**
 * ISATS Official Design Tokens — Elevation, Radius, Spacing, and Component Metrics
 */

export const ISATS_TOKENS = {
  radius: {
    xs:   '0.375rem', // 6px
    sm:   '0.5rem',   // 8px - Inputs, buttons
    md:   '0.625rem', // 10px - Inputs, buttons
    lg:   '0.75rem',  // 12px - Small cards, selects
    xl:   '1rem',     // 16px - Standard cards, modals
    '2xl':'1.25rem',  // 20px - Large feature cards
    full: '9999px',   // Badges, pills, avatar
  },
  shadows: {
    card:    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    elevated:'0 4px 20px -2px rgba(0, 0, 0, 0.25)',
    glow:    '0 0 20px rgba(37, 99, 235, 0.2)',
    cyanGlow:'0 0 20px rgba(6, 182, 212, 0.2)',
  },
  layout: {
    sidebarWidthExpanded: '260px',
    sidebarWidthCollapsed:'72px',
    topbarHeight:         '64px',
  },
  zIndex: {
    base:     0,
    dropdown: 30,
    sticky:   40,
    sidebar:  50,
    modal:    60,
    toast:    70,
    loader:   100,
  },
} as const
