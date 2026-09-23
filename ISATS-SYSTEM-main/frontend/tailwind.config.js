/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Master Enterprise SaaS Palette
        app: {
          bg: '#F5F3EC',
          warm: '#FBFAF6',
          card: '#FDFCF9',
          elevated: '#FFFFFF',
          border: '#E5E1D8',
          dark: '#0B1F1A',
          green: '#123C32',
          text: '#17211D',
          muted: '#64706A',
        },
        // Dark Mode Layered Enterprise Palette
        darkapp: {
          bg: '#07130F',
          surface: '#0B1F1A',
          surface2: '#102A23',
          border: '#1D3A31',
          primary: '#34D399',
          action: '#60A5FA',
          text: '#F3F7F5',
          muted: '#94A3A0',
        },
        primary: {
          50:  '#F5F3EC',
          100: '#E5E1D8',
          200: '#CCFBF1',
          300: '#34D399',
          400: '#0F766E',
          500: '#123C32',
          600: '#0E2F27',
          700: '#0B1F1A',
          800: '#0B1F1A',
          850: '#081713',
          900: '#07130F',
          950: '#040B09',
        },
        navy: {
          DEFAULT: '#0B1F1A',
          canvas:  '#07130F',
          surface: '#0B1F1A',
          card:    '#102A23',
          border:  '#1D3A31',
        },
        blue: {
          DEFAULT: '#2563EB',
          light:   '#60A5FA',
          dark:    '#1D4ED8',
        },
        teal: {
          DEFAULT: '#0F766E',
          soft:    '#CCFBF1',
        },
        success: {
          DEFAULT: '#15803D',
          light:   '#34D399',
          bg:      'rgba(21, 128, 61, 0.12)',
        },
        warning: {
          DEFAULT: '#D97706',
          light:   '#FBBF24',
          bg:      'rgba(217, 119, 6, 0.12)',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#F87171',
          bg:      'rgba(220, 38, 38, 0.12)',
        },
        purple: {
          DEFAULT: '#7C3AED',
          light:   '#A78BFA',
        },
        surface: '#FDFCF9',
        border:  '#E5E1D8',
        muted:   '#64706A',
        background: '#F5F3EC',
      },
      fontFamily: {
        sans: ['var(--font-primary)', '"IBM Plex Mono"', 'monospace'],
        primary: ['var(--font-primary)', '"IBM Plex Mono"', 'monospace'],
        heading: ['var(--font-heading)', '"JetBrains Mono"', 'monospace'],
        brand: ['var(--font-brand)', '"Space Mono"', 'monospace'],
        mono: ['var(--font-heading)', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(11,31,26,0.06), 0 10px 20px -2px rgba(11,31,26,0.03)',
        card: '0 1px 3px 0 rgba(11,31,26,0.08), 0 1px 2px -1px rgba(11,31,26,0.05)',
        glow: '0 0 20px rgba(15,118,110,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
