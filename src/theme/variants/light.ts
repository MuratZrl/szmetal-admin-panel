// src/theme/variants/light.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Light modda da kırmızı tonları koyulaştırıldı
const TEXT = '#111827';
const OUTLINE = '#9CA3AF';

export const lightPalette = {
  mode: 'light',

  // Daha koyu kırmızı ana palet
  primary:   { main: '#7F1115', light: '#b69092ff', dark: '#4C0A0D', contrastText: '#FFFFFF' },
  secondary: { main: '#7A1C0E', light: '#A33A21', dark: '#4B1009', contrastText: '#FFFFFF' },

  warning: { main: '#B4690E', light: '#D78A0D', dark: '#7A4708', contrastText: '#111111' },
  error:   { main: '#991B1B', light: '#B91C1C', dark: '#5C0D0D', contrastText: '#FFFFFF' },
  success: { main: '#16A34A', light: '#22C55E', dark: '#15803D', contrastText: '#FFFFFF' },
  info:    { main: '#0A8AAA', light: '#06B6D4', dark: '#0E7490', contrastText: '#FFFFFF' },

  // Taleplerin durumları (light)
  requestStatus: {
    pending:  { bg: '#FFF4D6', fg: '#7A4E00', bd: '#FFE2A1' },
    approved: { bg: '#E8F5E9', fg: '#1B5E20', bd: '#C8E6C9' },
    rejected: { bg: '#FBE9EA', fg: '#7A1C1C', bd: '#F3C2C5' },
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.92),
    disabled: alpha(TEXT, 0.38),
  },

  divider: alpha(OUTLINE, 0.22),

  background: {
    default: '#FFFFFF',
    paper:   '#F8F9FB',
  },

  // Özel yüzey katmanları (light)
  surface: {
    1: '#F8F9FB',
    2: '#FFFFFF',
    3: '#F3F4F6',
    4: '#E7E9EE',
    outline: alpha(OUTLINE, 0.30),
    muted:   alpha(OUTLINE, 0.14),
  },

  // Kırmızı vurgu
  accent: {
    main: '#A61B21',
    light: '#DC3B42',
    dark: '#6E1216',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active:             alpha(TEXT, 0.56),
    hover:              alpha(TEXT, 0.06),
    selected:           alpha(TEXT, 0.10),
    disabled:           alpha(TEXT, 0.30),
    disabledBackground: alpha(TEXT, 0.10),
    focus:              alpha(TEXT, 0.12),
  },

  contrastThreshold: 3,
  tonalOffset: 0.2,
} as const satisfies PaletteOptions;
