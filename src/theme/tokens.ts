// ============================================================================
// MSOT Clubs — Design Tokens
// Approved Palette: Navy, Blue, Cyan, Teal, White (ONLY)
// ============================================================================

export const colors = {
  // Navy / Dark Blue (Primary text, dark accents, brand grounding)
  navy: {
    950: '#060D1A',
    900: '#0A192F',
    800: '#112240',
    700: '#1B315B',
    600: '#233F77',
    500: '#32569C',
  },
  // Blue (Primary interactive elements, buttons, active states)
  blue: {
    700: '#1D4ED8',
    600: '#2563EB',
    500: '#3B82F6',
    400: '#60A5FA',
    300: '#93C5FD',
    200: '#BFDBFE',
    100: '#DBEAFE',
    50: '#EFF6FF',
  },
  // Cyan (Secondary highlights, focus indicators, tech glow)
  cyan: {
    700: '#0E7490',
    600: '#0891B2',
    500: '#06B6D4',
    400: '#22D3EE',
    300: '#67E8F9',
    200: '#A5F3FC',
    100: '#CFFAFE',
    50: '#ECFEFF',
  },
  // Teal (Success states, positive achievements, subtle badges)
  teal: {
    700: '#0F766E',
    600: '#0D9488',
    500: '#14B8A6',
    400: '#2DD4BF',
    300: '#5EEAD4',
    200: '#99F6E4',
    100: '#CCFBF1',
    50: '#F0FDFA',
  },
  // Canvas & Light Surfaces (Pale blue-whites)
  surface: {
    canvas: '#F4F8FC',
    canvasSecondary: '#EBF3FB',
    cardGlass: 'rgba(255, 255, 255, 0.78)',
    cardGlassHigh: 'rgba(255, 255, 255, 0.92)',
    cardGlassDark: 'rgba(10, 25, 47, 0.85)',
    borderLight: 'rgba(147, 197, 253, 0.35)',
    borderMedium: 'rgba(59, 130, 246, 0.25)',
    borderGlow: 'rgba(6, 182, 212, 0.45)',
  },
  // Text contrast
  text: {
    primary: '#0A192F',
    secondary: '#1B315B',
    muted: '#475569',
    inverse: '#FFFFFF',
    accent: '#0891B2',
  },
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)',
  accent: 'linear-gradient(135deg, #0891B2 0%, #14B8A6 100%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.65) 100%)',
  glassHeader: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(244, 248, 252, 0.85) 100%)',
  darkHero: 'linear-gradient(135deg, #0A192F 0%, #112240 60%, #0891B2 100%)',
  cardShine: 'linear-gradient(120deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(6, 182, 212, 0.15) 100%)',
} as const;

export const shadows = {
  glassSm: '0 2px 8px -2px rgba(10, 25, 47, 0.06), 0 1px 4px -1px rgba(10, 25, 47, 0.04)',
  glassMd: '0 8px 24px -4px rgba(10, 25, 47, 0.08), 0 2px 8px -2px rgba(10, 25, 47, 0.04)',
  glassLg: '0 16px 36px -6px rgba(10, 25, 47, 0.12), 0 4px 12px -2px rgba(10, 25, 47, 0.06)',
  glowCyan: '0 0 20px -2px rgba(6, 182, 212, 0.35)',
  glowBlue: '0 0 20px -2px rgba(37, 99, 235, 0.35)',
  isometric3D: '0 20px 30px -10px rgba(10, 25, 47, 0.18), 0 6px 12px -3px rgba(14, 116, 144, 0.15), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
} as const;
