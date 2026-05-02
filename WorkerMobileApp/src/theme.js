const theme = {
  colors: {
    // Core Palette
    background: '#0F172A', // slate-950
    surface: '#1E293B',    // slate-800
    surfaceLight: '#2D3748', // Custom lighter surface
    primary: '#34D399',    // emerald-400
    textPrimary: '#F8FAFC', // slate-50
    textSecondary: '#94A3B8', // slate-400
    textMuted: '#64748B',    // slate-500
    textDark: '#475569',     // slate-600
    textContrast: '#0F172A', // slate-950 (for use on primary)
    textSlate100: '#F1F5F9', // slate-100
    textSlate200: '#E2E8F0', // slate-200
    textSlate300: '#CBD5E1', // slate-300

    // Status
    danger: '#EF4444',     // red-500
    success: '#10B981',    // emerald-500
    warning: '#FBBF24',    // amber-400
    info: '#3B82F6',       // blue-500

    // Shadows
    shadow: '#000000',

    // Borders
    border: '#334155',     // slate-700
    borderStrong: '#4A5568', // slate-600

    // Transparent Overlays
    primaryTransparent: 'rgba(52, 211, 153, 0.15)',
    primarySemiTransparent: 'rgba(52, 211, 153, 0.2)',
    dangerTransparent: 'rgba(239, 68, 68, 0.15)',
    successTransparent: 'rgba(16, 185, 129, 0.15)',
    warningTransparent: 'rgba(251, 191, 36, 0.1)',
    slateTransparent: 'rgba(15, 23, 42, 0.4)',
    borderTransparent: 'rgba(16, 185, 129, 0.2)',
    pulseTransparent: 'rgba(52, 211, 153, 0.2)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  roundness: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  }
};

export default theme;
