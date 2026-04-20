// Cozy Receipt Club — design tokens
// Mirrors the spec in the design brief (gluestack-ui-v2.md)
// Used across all components as a single source of truth.

export const colors = {
  // Backgrounds
  canvas: '#fefaf2',
  surface: '#ffffff',
  surfaceSubtle: '#fff7ed',

  // Primary — warm coral
  primary50: '#fff1ee',
  primary100: '#ffe0d8',
  primary200: '#ffc4b3',
  primary300: '#ff9e86',
  primary400: '#ff7057',
  primary500: '#f95032',
  primary600: '#e03620',
  primary700: '#bc2515',

  // Accent — mint (success / reward)
  mint300: '#6ee7c2',
  mint400: '#34d399',
  mint500: '#10b981',
  mint600: '#059669',

  // Reward — warm gold
  gold300: '#fde68a',
  gold400: '#fbbf24',
  gold500: '#f59e0b',

  // Brand — soft lavender (points badge)
  lavender200: '#ede9fe',
  lavender400: '#a78bfa',
  lavender600: '#7c3aed',
  lavender700: '#6d28d9',

  // Neutral
  ink900: '#1c1917',
  ink700: '#44403c',
  ink500: '#78716c',
  ink300: '#d6d3d1',
  ink100: '#f5f5f4',

  // Semantic
  errorBg: '#fef2f2',
  errorText: '#991b1b',
  errorBorder: '#fecaca',
  successBg: '#ecfdf5',
  successText: '#065f46',
  successBorder: '#6ee7b7',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;
