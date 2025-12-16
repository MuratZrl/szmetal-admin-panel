// src/theme/variants/light.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const TEXT = '#0B0B0B';
const OUTLINE = '#475569'; // slate-600 civarı, light’ta daha temiz kontur

// Tek kaynak: statü renkleri (light/dark aynı)
const STATUS = {
  Active: '#22C55E',
  Inactive: '#F59E0B',
  Banned: '#D0182C',
} as const;

// Light rozetler: okunur ama “çamur” olmayan dolgu
const badge = (main: string) => ({
  bg: alpha(main, 0.14),
  fg: main,
  bd: alpha(main, 0.32),
});

export const lightPalette = {
  mode: 'light',

  primary: {
    main: '#B3122F',
    light: '#D34C63',
    dark: '#7F0F23',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#7A3A3D',
    light: '#A35C61',
    dark: '#532528',
    contrastText: '#FFFFFF',
  },

  success: { main: STATUS.Active, light: '#86E9A6', dark: '#187945', contrastText: TEXT },
  warning: { main: STATUS.Inactive, light: '#FCD34D', dark: '#B45309', contrastText: TEXT },
  error: { main: STATUS.Banned, light: '#F29AA4', dark: '#7A0E1A', contrastText: '#FFFFFF' },
  info: { main: '#2F6EE5', light: '#86B0FF', dark: '#1E3F94', contrastText: '#FFFFFF' },

  contrast: {
    main: TEXT,
    contrastText: '#FFFFFF',
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
      '#7A3A3D',
    ] as const,
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.74),
    disabled: alpha(TEXT, 0.40),
  },

  divider: alpha(OUTLINE, 0.16),

  background: {
    default: '#F6F7F9',
    paper: '#FFFFFF',
    elevated: '#FFFFFF',
  },

  surface: {
    1: '#FFFFFF',
    2: '#F9FAFB',
    3: '#F1F5F9',
    4: '#E8EEF5',
    outline: alpha(OUTLINE, 0.28),
    muted: alpha(OUTLINE, 0.14),
  },

accent: {
  main: '#B3122F',
  light: '#D34C63', // primary.light ile aynı
  dark:  '#7F0F23', // primary.dark ile aynı
  contrastText: '#FFFFFF',
},

  grey,

  action: {
    active: alpha(TEXT, 0.64),
    hover: alpha('#000000', 0.05),
    selected: alpha('#000000', 0.09),
    disabled: alpha(TEXT, 0.40),
    disabledBackground: alpha('#000000', 0.10),
    focus: alpha('#000000', 0.16),
  },

  contrastThreshold: 3.2,
  tonalOffset: 0.22,
} as const satisfies PaletteOptions;
