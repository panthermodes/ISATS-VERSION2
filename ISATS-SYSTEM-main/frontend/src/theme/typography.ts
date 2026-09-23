/**
 * ISATS Official Design Tokens — Monospace Typography System
 * Role-based technical & enterprise typography architecture.
 */

export const ISATS_TYPOGRAPHY = {
  fontFamily: {
    primary:   '"IBM Plex Mono", "Courier New", monospace',
    heading:   '"JetBrains Mono", "Courier New", monospace',
    brand:     '"Space Mono", "Courier New", monospace',
    technical: '"Courier New", monospace',
    sans:      '"IBM Plex Mono", "Courier New", monospace',
    mono:      '"JetBrains Mono", "Courier New", monospace',
  },
  fontWeight: {
    regular:  400, // Normal UI, body, cell content
    medium:   500, // Emphasized text, technical codes/IDs
    semibold: 600, // Labels, buttons, card titles
    bold:     700, // Headings, statistics, branding, important data
    black:    900, // Extreme emphasis
  },
  fontSize: {
    xs:    '0.75rem',    // 12px
    sm:    '0.875rem',   // 14px
    base:  '1rem',       // 16px
    lg:    '1.125rem',   // 18px
    xl:    '1.25rem',    // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
    '4xl': '2.25rem',    // 36px
  },
  lineHeight: {
    heading: 1.25,
    body:    1.6,
    code:    1.4,
  },
  letterSpacing: {
    tight:   '-0.02em',
    normal:  '-0.01em',
    wide:    '0.03em',
    wider:   '0.06em',
    widest:  '0.1em',
  },
  // Specific role mappings conforming to system specifications
  roles: {
    systemBrand: {
      fontFamily: '"Space Mono", "Courier New", monospace',
      fontWeight: 700,
      fontSize: '1.75rem', // 28-32px responsive
    },
    pageTitle: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontWeight: 700,
      fontSize: '1.625rem', // 24-30px (desktop), 20-24px (mobile)
    },
    sectionTitle: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontWeight: 700,
      fontSize: '1.25rem', // 18-22px
    },
    cardTitle: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontWeight: 600,
      fontSize: '1rem', // 14-18px
    },
    body: {
      fontFamily: '"IBM Plex Mono", "Courier New", monospace',
      fontWeight: 400,
      fontSize: '0.875rem', // 13-15px
      lineHeight: 1.6,
    },
    secondary: {
      fontFamily: '"IBM Plex Mono", "Courier New", monospace',
      fontWeight: 400,
      fontSize: '0.75rem', // 11-13px
      lineHeight: 1.5,
    },
    label: {
      fontFamily: '"IBM Plex Mono", "Courier New", monospace',
      fontWeight: 600,
      fontSize: '0.8125rem', // 11-13px
    },
    button: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontWeight: 600,
      fontSize: '0.8125rem', // 12-14px
    },
    statisticNumber: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontWeight: 700,
      fontSize: '1.75rem', // 20-32px (desktop), 18-26px (mobile)
    },
    technicalCode: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontWeight: 500,
      fontSize: '0.8125rem', // 12-14px
    },
    systemStatus: {
      fontFamily: '"Space Mono", "Courier New", monospace',
      fontWeight: 700,
      fontSize: '0.6875rem', // 10-12px
    },
    loadingText: {
      fontFamily: '"Courier New", "Space Mono", monospace',
      fontWeight: 700,
      fontSize: '0.875rem',
    },
  },
} as const
