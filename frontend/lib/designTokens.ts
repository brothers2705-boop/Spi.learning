// SPI LEARNING — Design System Tokens — Single source of truth
// Applied consistently across user site AND admin panel (separate bundles but same tokens)

export const tokens = {
  colors: {
    // Light mode
    light: {
      background: '#fcfcf9',
      backgroundSubtle: '#ffffff',
      backgroundMuted: '#f4f4f5',
      foreground: '#18181b',
      foregroundMuted: '#71717a',
      foregroundSubtle: '#a1a1aa',
      border: '#e4e4e7',
      borderStrong: '#d4d4d8',
      primary: '#18181b',
      primaryForeground: '#ffffff',
      secondary: '#f4f4f5',
      secondaryForeground: '#18181b',
      accent: '#7c3aed',
      accentForeground: '#ffffff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      violet: '#7c3aed',
      emerald: '#10b981',
      amber: '#f59e0b',
    },
    // Dark mode
    dark: {
      background: '#0a0a0a',
      backgroundSubtle: '#141414',
      backgroundMuted: '#1a1a1a',
      foreground: '#fafafa',
      foregroundMuted: '#a1a1aa',
      foregroundSubtle: '#71717a',
      border: '#27272a',
      borderStrong: '#3f3f46',
      primary: '#fafafa',
      primaryForeground: '#0a0a0a',
      secondary: '#1a1a1a',
      secondaryForeground: '#fafafa',
      accent: '#8b5cf6',
      accentForeground: '#ffffff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      violet: '#8b5cf6',
      emerald: '#10b981',
      amber: '#f59e0b',
    },
    // Admin specific — dark only, separate but using same hue
    admin: {
      background: '#0a0a0a',
      surface: '#141414',
      surfaceHover: '#1a1a1a',
      border: '#232323',
      borderStrong: '#2a2a2a',
      primary: '#fafafa',
      accent: '#7c3aed',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 12px -2px rgba(0,0,0,0.08)',
    lg: '0 8px 24px -8px rgba(0,0,0,0.08)',
    xl: '0 16px 40px -12px rgba(0,0,0,0.15)',
    glowViolet: '0 4px 14px -2px rgba(124,58,237,0.5)',
    glowVioletLg: '0 8px 20px -4px rgba(124,58,237,0.5)',
  },
  typography: {
    fontFamily: {
      inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "'Newsreader', Georgia, serif",
      mono: "'Geist Mono', ui-monospace, monospace",
      arabic: "'Cairo', 'Tajawal', 'Inter', sans-serif",
    },
    fontSize: {
      xs: '11px',
      sm: '12px',
      md: '13px',
      base: '14px',
      lg: '15px',
      xl: '16px',
      '2xl': '20px',
      '3xl': '28px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '64px',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '0.9',
      snug: '1.15',
      normal: '1.5',
      relaxed: '1.6',
      loose: '1.8',
    },
    letterSpacing: {
      tight: '-0.03em',
      snug: '-0.02em',
      normal: '-0.011em',
      mono: '0',
      wide: '0.05em',
    }
  },
  zIndex: {
    header: 30,
    sticky: 20,
    dropdown: 50,
    modal: 100,
    tooltip: 200,
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px',
    '3xl': '1920px',
  },
  touchTarget: '44px',
} as const;

// Helper to get CSS variables string for injection
export function getCssVariables(isDark = false) {
  const colors = isDark ? tokens.colors.dark : tokens.colors.light;
  return `
    --color-background: ${colors.background};
    --color-background-subtle: ${colors.backgroundSubtle};
    --color-background-muted: ${colors.backgroundMuted};
    --color-foreground: ${colors.foreground};
    --color-foreground-muted: ${colors.foregroundMuted};
    --color-foreground-subtle: ${colors.foregroundSubtle};
    --color-border: ${colors.border};
    --color-border-strong: ${colors.borderStrong};
    --color-primary: ${colors.primary};
    --color-primary-foreground: ${colors.primaryForeground};
    --color-accent: ${colors.accent};
    --color-success: ${colors.success};
    --color-warning: ${colors.warning};
    --color-error: ${colors.error};
    --radius-sm: ${tokens.radii.sm};
    --radius-md: ${tokens.radii.md};
    --radius-lg: ${tokens.radii.lg};
    --radius-xl: ${tokens.radii.xl};
    --radius-2xl: ${tokens.radii['2xl']};
    --radius-full: ${tokens.radii.full};
    --shadow-sm: ${tokens.shadows.sm};
    --shadow-md: ${tokens.shadows.md};
    --shadow-lg: ${tokens.shadows.lg};
    --shadow-xl: ${tokens.shadows.xl};
    --font-inter: ${tokens.typography.fontFamily.inter};
    --font-display: ${tokens.typography.fontFamily.display};
    --font-mono: ${tokens.typography.fontFamily.mono};
    --font-arabic: ${tokens.typography.fontFamily.arabic};
  `;
}
