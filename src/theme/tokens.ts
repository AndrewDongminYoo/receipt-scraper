// Cozy Receipt Club — design tokens
// Mirrors the spec in the design brief (gluestack-ui-v2.md)
// Used across all components as a single source of truth.

export const colors = {
  // Backgrounds
  canvas: '#FEFAF2',
  surface: '#FFFFFF',
  surfaceSubtle: '#FFF7ED',

  // Primary — warm coral
  primary50: '#FFF1EE',
  primary100: '#FFE0D8',
  primary200: '#FFC4B3',
  primary300: '#FF9E86',
  primary400: '#FF7057',
  primary500: '#F95032',
  primary600: '#E03620',
  primary700: '#BC2515',

  // Accent — mint (success / reward)
  mint300: '#6EE7C2',
  mint400: '#34D399',
  mint500: '#10B981',
  mint600: '#059669',

  // Reward — warm gold
  gold300: '#FDE68A',
  gold400: '#FBBF24',
  gold500: '#F59E0B',

  // Brand — soft lavender (points badge)
  lavender200: '#EDE9FE',
  lavender400: '#A78BFA',
  lavender600: '#7C3AED',
  lavender700: '#6D28D9',

  // Neutral
  ink900: '#1C1917',
  ink700: '#44403C',
  ink500: '#78716C',
  ink300: '#D6D3D1',
  ink100: '#F5F5F4',

  // Semantic
  errorBg: '#FEF2F2',
  errorText: '#991B1B',
  errorBorder: '#FECACA',
  successBg: '#ECFDF5',
  successText: '#065F46',
  successBorder: '#6EE7B7',
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
