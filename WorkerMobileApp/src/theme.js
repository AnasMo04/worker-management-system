const theme = {
  colors: {
    // Core Palette (Light Theme)
    background: '#F8FAFC', // Off-White
    surface: '#FFFFFF',    // Pure White
    surfaceLight: '#F1F5F9', // slate-100
    primary: '#10B981',    // Emerald-500
    textPrimary: '#1E293B', // Charcoal/Dark Slate (slate-800)
    textSecondary: '#64748B', // slate-500
    textMuted: '#94A3B8',    // slate-400
    textDark: '#334155',     // slate-700
    textContrast: '#FFFFFF', // Pure White (for use on primary)
    textSlate100: '#F1F5F9',
    textSlate200: '#E2E8F0',
    textSlate300: '#CBD5E1',

    // Status
    danger: '#EF4444',     // red-500
    success: '#10B981',    // emerald-500
    warning: '#FBBF24',    // amber-400
    info: '#3B82F6',       // blue-500

    // Shadows
    shadow: '#000000',

    // Borders
    border: '#E2E8F0',     // slate-200
    borderStrong: '#CBD5E1', // slate-300

    // Transparent Overlays
    primaryTransparent: 'rgba(16, 185, 129, 0.1)',
    primarySemiTransparent: 'rgba(16, 185, 129, 0.2)',
    dangerTransparent: 'rgba(239, 68, 68, 0.1)',
    successTransparent: 'rgba(16, 185, 129, 0.1)',
    warningTransparent: 'rgba(251, 191, 36, 0.1)',
    slateTransparent: 'rgba(241, 245, 249, 0.5)',
    borderTransparent: 'rgba(226, 232, 240, 0.5)',
    pulseTransparent: 'rgba(16, 185, 129, 0.2)',
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
