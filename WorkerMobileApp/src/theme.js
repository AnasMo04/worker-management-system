export const Theme = {
  colors: {
    background: '#f8fafc',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    primary: '#153a5c', // Navy Blue from Web
    primaryForeground: '#ffffff',
    secondary: '#38948a', // Teal from Web
    secondaryForeground: '#ffffff',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    destructive: '#dc2626',
    success: '#15803d',
    warning: '#f59e0b',
    info: '#0ea5e9',
    border: '#e2e8f0',
  },
  gradients: {
    kpi1: ['#1e40af', '#1e3a8a'], // blue-800 to blue-900
    kpi2: ['#0d9488', '#0f766e'], // teal-600 to teal-700
    kpi3: ['#d97706', '#b45309'], // amber-600 to amber-700
    kpi4: ['#dc2626', '#b91c1c'], // red-600 to red-700
    login: ['#0f172a', '#1e293b', '#0f172a'], // Dark Background Gradient
    primary: ['#153a5c', '#1e5a8d'],
    success: ['#15803d', '#16a34a'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    md: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    lg: {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    }
  }
};
