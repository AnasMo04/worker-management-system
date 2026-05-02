const theme = {
  colors: {
    // Core Palette (Dark Theme per UI_GUIDELINES.md)
    background: '#0F172A', // Dark Navy
    backgroundSecondary: '#0D1117', // Deeper Navy for gradients
    surface: '#1E293B',    // Slate-800
    surfaceLight: '#334155', // Slate-700
    primary: '#34D399',    // Mint Green (Emerald-400ish)
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8', // Slate-400
    textMuted: '#64748B',    // Slate-500
    textContrast: '#0F172A', // Dark Navy (for use on primary)

    // Status
    danger: '#EF4444',
    success: '#10B981',
    warning: '#FBBF24',
    info: '#3B82F6',

    // Shadows/Borders
    border: '#2D3748',
    borderLight: '#334155',
    shadow: '#000000',

    // Transparent Overlays
    primaryTransparent: 'rgba(52, 211, 153, 0.15)',
    surfaceTransparent: 'rgba(30, 41, 59, 0.7)',
    dangerTransparent: 'rgba(239, 68, 68, 0.15)',
    successTransparent: 'rgba(16, 185, 129, 0.15)',
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
  }
};

export default theme;
