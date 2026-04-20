export const colors = {
  canvas: '#f7f4ed',
  surface: '#fcfbf8',
  charcoal: '#1c1c1c',
  bodyText: 'rgba(28, 28, 28, 0.82)',
  muted: '#5f5f5d',
  border: '#eceae4',
  borderInteractive: 'rgba(28, 28, 28, 0.4)',
  hoverOverlay: 'rgba(28, 28, 28, 0.04)',

  successBg: '#ecfdf5',
  successText: '#065f46',
  successBorder: '#6ee7b7',

  errorBg: '#fef2f2',
  errorText: '#991b1b',
  errorBorder: '#fecaca',

  pendingBg: '#fffbeb',
  pendingText: '#92400e',
  pendingBorder: '#fde68a',
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
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
