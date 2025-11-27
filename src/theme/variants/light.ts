// src/theme/variants/light.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Açık, nötr, kırmızı vurgulu palet.
// Not: surface / accent / requestStatus / charts genişletmeleri ve "contrast" rengi
// için src/theme/types.d.ts içinde palette augmentasyonu yapılmış olmalı.

const TEXT = '#0B0B0B';
const OUTLINE = '#4B5563'; // nötr kontur üretmek için koyu gri (slate-ish)

// Tek kaynak: kullanıcı statü renkleri (dark ile aynı seti koruyoruz)
const STATUS = {
  Active:   '#22C55E', // success.main
  Inactive: '#F59E0B', // warning.main
  Banned:   '#D0182C', // error.main
} as const;

// Light rozetler: açık zeminde daha hafif dolgu + daha düşük kenar opaklığı
const badge = (main: string) => ({
  bg: alpha(main, 0.10),
  fg: main,
  bd: alpha(main, 0.26),
});

export const lightPalette = {
  mode: 'light',

  // Primary kırmızı ailesi (projeyle tutarlı)
  primary:   { main: '#B3122F', light: '#D34C63', dark: '#7F0F23', contrastText: '#FFFFFF' },
  secondary: { main: '#7A3A3D', light: '#A35C61', dark: '#532528', contrastText: '#FFFFFF' },

  success: { main: STATUS.Active,   light: '#86E9A6', dark: '#187945', contrastText: '#0B0B0B' },
  warning: { main: STATUS.Inactive, light: '#FCD34D', dark: '#ff5512ff', contrastText: '#0B0B0B' },
  error:   { main: STATUS.Banned,   light: '#F29AA4', dark: '#7A0E1A', contrastText: '#FFFFFF' },
  info:    { main: '#2F6EE5',       light: '#86B0FF', dark: '#1E3F94', contrastText: '#FFFFFF' },

  // Kontrast: light’ta siyah; outlined “contrast” buton/ikonlar için
  contrast: {
    main: TEXT,
    contrastText: '#FFFFFF',
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
      '#7A3A3D', // secondary
    ] as const,
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.72),
    disabled: alpha(TEXT, 0.38),
  },

  divider: alpha(OUTLINE, 0.18),

  background: {
    default: '#F7F8FA',
    paper:   '#FFFFFF',
    elevated: '#FFFFFF',
  },

  // Açık zeminde surface kademeleri
  surface: {
    1: '#FFFFFF',
    2: '#FAFAFB',
    3: '#F3F4F6',
    4: '#ECEEF1',
    outline: alpha(OUTLINE, 0.24),
    muted:   alpha(OUTLINE, 0.12),
  },

  // Vurgu rengi primary ile eşleşik
  accent: {
    main: '#B3122F',
    light: '#E2566C',
    dark:  '#760E21',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active:             alpha(TEXT, 0.64),
    hover:              alpha('#000000', 0.06),
    selected:           alpha('#000000', 0.10),
    disabled:           alpha(TEXT, 0.38),
    disabledBackground: alpha('#000000', 0.10),
    focus:              alpha('#000000', 0.18),
  },

  contrastThreshold: 3.1,
  tonalOffset: 0.22,
} as const satisfies PaletteOptions;
