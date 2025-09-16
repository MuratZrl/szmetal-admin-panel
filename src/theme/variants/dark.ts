// src/theme/variants/dark.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Daha tok, koyu ama biraz daha açık kırmızı palet
const TEXT = '#F3F4F6';
const OUTLINE = '#93A4B0';

export const darkPalette = {
  mode: 'dark',

  // Kırmızıları bir tık açtım (≈ +8–10% luminance)
  primary:   { main: '#C21F25', light: '#D63B42', dark: '#7A1216', contrastText: '#FFFFFF' },
  secondary: { main: '#8C2213', light: '#B03B25', dark: '#58160D', contrastText: '#FFFFFF' },

  warning: { main: '#D78A0D', light: '#F2B746', dark: '#8A5A08', contrastText: '#0B0B0B' },
  error:   { main: '#B91C1C', light: '#DC2626', dark: '#7F1D1D', contrastText: '#FFFFFF' },
  success: { main: '#22C55E', light: '#86EFAC', dark: '#15803D', contrastText: '#0B0B0B' },
  info:    { main: '#06B6D4', light: '#67E8F9', dark: '#0E7490', contrastText: '#0B0B0B' },

  requestStatus: {
    pending:  { bg: '#2E2204', fg: '#FFD667', bd: '#473408' },
    approved: { bg: '#0E2414', fg: '#66D17A', bd: '#15361E' },
    rejected: { bg: '#2A0E10', fg: '#F8A9A9', bd: '#45171A' },
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.78), // %6 daha belirgin
    disabled: alpha(TEXT, 0.40),  // çok az artırıldı
  },

  divider: alpha(OUTLINE, 0.18), // çizgiler bir ton daha görünür

  background: {
    default: '#0A0A0A',
    paper:   '#111214',
  },

  surface: {
    1: '#111214',
    2: '#16181B',
    3: '#1B2024',
    4: '#23272C',
    outline: alpha(OUTLINE, 0.16),
    muted:   alpha(OUTLINE, 0.08),
  },

  // Accent'i de kırmızı ailesinde bir tık açtım
  accent: {
    main: '#C6252B',
    light: '#E0474E',
    dark:  '#8A181D',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active:             alpha(TEXT, 0.56),
    hover:              alpha(TEXT, 0.07), // 0.06 → 0.07
    selected:           alpha(TEXT, 0.12),
    disabled:           alpha(TEXT, 0.32),
    disabledBackground: alpha(TEXT, 0.11),
    focus:              alpha(TEXT, 0.12),
  },

  contrastThreshold: 3,
  tonalOffset: 0.2,
} as const satisfies PaletteOptions;
