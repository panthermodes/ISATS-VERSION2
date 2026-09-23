import { useTheme } from '@/context/ThemeContext'
import { ISATS_COLORS } from '@/theme/colors'

export function useRechartsTheme() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return {
    isDark,
    background: isDark ? '#101D2E' : '#FFFFFF',
    border:     isDark ? '#1E293B' : '#E2E8F0',
    textPrimary:isDark ? '#F8FAFC' : '#0F172A',
    textMuted:  isDark ? '#94A3B8' : '#64748B',
    gridStroke: isDark ? '#1E293B' : '#F1F5F9',
    tooltipStyle: {
      backgroundColor: isDark ? '#0B1728' : '#FFFFFF',
      borderColor:     isDark ? '#1E293B' : '#E2E8F0',
      borderRadius:    '0.75rem',
      color:           isDark ? '#F8FAFC' : '#0F172A',
      fontSize:        '0.75rem',
      boxShadow:       '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
      padding:         '8px 12px',
    },
    colors: {
      primary: ISATS_COLORS.primary.DEFAULT,
      cyan:    ISATS_COLORS.accent.cyan,
      success: ISATS_COLORS.semantic.success.DEFAULT,
      warning: ISATS_COLORS.semantic.warning.DEFAULT,
      danger:  ISATS_COLORS.semantic.danger.DEFAULT,
      retired: ISATS_COLORS.semantic.retired.DEFAULT,
      palette: [
        '#2563EB', '#06B6D4', '#10B981', '#F59E0B',
        '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
      ],
    },
  }
}
