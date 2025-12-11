// src/theme/variants/dark.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Koyu, ciddi, kırmızı ağırlıklı palet.
// Not: surface / accent / requestStatus / charts genişletmeleri ve "contrast" rengi
// için src/theme/types.d.ts içinde palette augmentasyonu yapılmış olmalı.

const TEXT = '#F2F4F6';
const OUTLINE = '#9FA4AA';

// Tek kaynak: kullanıcı statü renkleri
const STATUS = {
  Active:   '#22C55E', // success.main
  Inactive: '#F59E0B', // warning.main
  Banned:   '#D0182C', // error.main
} as const;

// Requests rozetlerini aynı renklerden türet
const badge = (main: string) => ({
  bg: alpha(main, 0.14), // koyu temada hafif dolgu
  fg: main,              // pastel yerine ana renk
  bd: alpha(main, 0.36), // belirgin ama göz yormayan kenar
});

export const darkPalette = {
  mode: 'dark',

  // Derin bordo-kırmızı ana vurgu
  primary:   { main: '#990d26ff', light: '#E2566C', dark: '#760E21', contrastText: '#FFFFFF' },
  // İkincil: daha kahverengiye yakın koyu kırmızı
  secondary: { main: '#6F272A', light: '#9C4A4F', dark: '#441618', contrastText: '#F8F9FA' },

  success: { main: STATUS.Active,   light: '#7EE8A1', dark: '#155E34', contrastText: '#0B0B0B' },
  warning: { main: STATUS.Inactive, light: '#fab30dff', dark: '#92400E', contrastText: '#0B0B0B' },
  error:   { main: STATUS.Banned,   light: '#F29AA4', dark: '#7A0E1A', contrastText: '#FFFFFF' },
  info:    { main: '#2F6EE5',       light: '#86B0FF', dark: '#1E3F94', contrastText: '#FFFFFF' },

  // Kontrast: dark’ta beyaz; outlined butonlarda "beyaz" stili için kullanılır
  contrast: {
    main: TEXT,
    contrastText: '#0B0B0B',
  },

  // Requests rozetleri = Users status ile aynı renk ailesi
  requestStatus: {
    pending:  badge(STATUS.Inactive),
    approved: badge(STATUS.Active),
    rejected: badge(STATUS.Banned),
  },

  // Users için statü renkleri (tek kaynak)
  status: STATUS,

  charts: {
    categorical: [
      '#B3122F', // primary
      '#2F6EE5', // info
      STATUS.Active,
      STATUS.Inactive,
      STATUS.Banned,
      '#6F272A', // secondary
    ] as const,
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.84),
    disabled: alpha(TEXT, 0.40),
  },

  divider: alpha(OUTLINE, 0.24),

  background: {
    default: 'rgba(10, 10, 10, 1)',
    paper:   '#100D0E',
  },

  surface: {
    1: '#000000ff',
    2: '#0c0c0cff',
    3: '#161616ff',
    4: '#302e2eff',
    outline: alpha(OUTLINE, 0.22),
    muted:   alpha(OUTLINE, 0.12),
  },

  // Vurgu rengi primary ile eşleşik
  accent: {
    main: '#101010ff',
    light: '#1b1b1bff',
    dark:  '#1d1d1dff',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active:             alpha(TEXT, 0.68),
    hover:              alpha('#FFFFFF', 0.08),
    selected:           alpha('#FFFFFF', 0.16),
    disabled:           alpha(TEXT, 0.36),
    disabledBackground: alpha('#FFFFFF', 0.12),
    focus:              alpha('#FFFFFF', 0.20),
  },

  contrastThreshold: 3.9,
  tonalOffset: 0.24,
} as const satisfies PaletteOptions;
