// src/theme/variants/dark.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const TEXT = '#F2F4F6';
const OUTLINE = '#9CA3AF';

// Tek kaynak: statü renkleri (light/dark aynı)
const STATUS = {
  Active: '#22C55E',
  Inactive: '#F59E0B',
  Banned: '#D0182C',
} as const;

// Dark rozetler: koyu zeminde daha “tok” dolgu
const badge = (main: string) => ({
  bg: alpha(main, 0.18),
  fg: main,
  bd: alpha(main, 0.44),
});

export const darkPalette = {
  mode: 'dark',

  // Brand kırmızısı iki temada da aynı kalsın, dark’ta “daha koyu” his surface ile gelsin
  primary: {
    main: '#B3122F',
    light: '#E2566C',
    dark: '#760E21',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#6F272A',
    light: '#9C4A4F',
    dark: '#441618',
    contrastText: '#F8F9FA',
  },

  success: { main: STATUS.Active, light: '#7EE8A1', dark: '#155E34', contrastText: '#0B0B0B' },
  warning: { main: STATUS.Inactive, light: '#FCD34D', dark: '#92400E', contrastText: '#0B0B0B' },
  error: { main: STATUS.Banned, light: '#F29AA4', dark: '#7A0E1A', contrastText: '#FFFFFF' },
  info: { main: '#2F6EE5', light: '#86B0FF', dark: '#1E3F94', contrastText: '#FFFFFF' },

  contrast: {
    main: TEXT,
    contrastText: '#0B0B0B',
  },

  requestStatus: {
    pending: badge(STATUS.Inactive),
    approved: badge(STATUS.Active),
    rejected: badge(STATUS.Banned),
  },

  status: STATUS,

  charts: {
    categorical: [
      '#B3122F',
      '#2F6EE5',
      STATUS.Active,
      STATUS.Inactive,
      STATUS.Banned,
      '#6F272A',
    ] as const,
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.82),
    disabled: alpha(TEXT, 0.46),
  },

  divider: alpha(OUTLINE, 0.22),

  background: {
    default: '#0B0B0D',
    paper: '#111114',
    elevated: '#1A1A1F',
  },

  // “tam siyah” yerine hafif kömür: göz daha az yorulur, border daha iyi görünür
  surface: {
    1: '#0F0F13',
    2: '#141419',
    3: '#1B1B22',
    4: '#24242C',
    outline: alpha(OUTLINE, 0.24),
    muted: alpha(OUTLINE, 0.14),
  },

  accent: {
    main: '#B3122F',
    light: '#E2566C',
    dark: '#760E21',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active: alpha(TEXT, 0.68),
    hover: alpha('#FFFFFF', 0.06),
    selected: alpha('#FFFFFF', 0.12),
    disabled: alpha(TEXT, 0.40),
    disabledBackground: alpha('#FFFFFF', 0.10),
    focus: alpha('#FFFFFF', 0.18),
  },

  contrastThreshold: 3.9,
  tonalOffset: 0.24,
} as const satisfies PaletteOptions;
