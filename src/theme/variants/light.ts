// src/theme/variants/light.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const TEXT = '#111827';
const OUTLINE = '#9CA3AF';

// surface & accent için types.d.ts ile Palette genişletmesi yapılmış olmalı.
export const lightPalette = {
  mode: 'light',

  primary: { main: '#B91C1C', light: '#DC2626', dark: '#7F1D1D', contrastText: '#FFFFFF' },
  secondary:{ main: '#EA580C', light: '#F97316', dark: '#9A3412', contrastText: '#FFFFFF' },

  warning:  { main: '#D97706', light: '#F59E0B', dark: '#92400E', contrastText: '#111111' },
  error:    { main: '#C81E1E', light: '#E11D48', dark: '#991B1B', contrastText: '#FFFFFF' },
  success:  { main: '#16A34A', light: '#22C55E', dark: '#15803D', contrastText: '#FFFFFF' },
  info:     { main: '#0891B2', light: '#06B6D4', dark: '#0E7490', contrastText: '#FFFFFF' },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.72),
    disabled: alpha(TEXT, 0.38),
  },

  divider: alpha(OUTLINE, 0.22),

  background: {
    default: '#FFFFFF',
    paper:   '#F9FAFB',
  },

  // Özel yüzey katmanları
  surface: {
    1: '#F9FAFB',
    2: '#FFFFFF',
    3: '#F3F4F6',
    4: '#E5E7EB',
    outline: alpha(OUTLINE, 0.30),
    muted:   alpha(OUTLINE, 0.14),
  },

  // İkincil vurgu rengi
  accent: {
    main: '#D97706',
    light: '#FCD34D',
    dark: '#92400E',
    contrastText: '#111111',
  },

  grey,

  action: {
    active:            alpha(TEXT, 0.56),
    hover:             alpha(TEXT, 0.06),
    selected:          alpha(TEXT, 0.10),
    disabled:          alpha(TEXT, 0.30),
    disabledBackground:alpha(TEXT, 0.10),
    focus:             alpha(TEXT, 0.12),
  },

  contrastThreshold: 3,
  tonalOffset: 0.2,
} as const satisfies PaletteOptions;
