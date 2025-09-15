// src/theme/variants/dark.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const TEXT = '#F3F4F6';
const OUTLINE = '#93A4B0';

// surface & accent için types.d.ts ile Palette genişletmesi yapılmış olmalı.
export const darkPalette = {
  mode: 'dark',

  primary:   { main: '#F87171', light: '#FDA4AF', dark: '#B91C1C', contrastText: '#0B0B0B' },
  secondary: { main: '#F97316', light: '#FB923C', dark: '#C2410C', contrastText: '#0B0B0B' },

  warning: { main: '#F59E0B', light: '#FDE68A', dark: '#B45309', contrastText: '#0B0B0B' },
  error:   { main: '#EF4444', light: '#FCA5A5', dark: '#B91C1C', contrastText: '#0B0B0B' },
  success: { main: '#22C55E', light: '#86EFAC', dark: '#15803D', contrastText: '#0B0B0B' },
  info:    { main: '#06B6D4', light: '#67E8F9', dark: '#0E7490', contrastText: '#0B0B0B' },

  requestStatus: {
    pending:  { bg: '#3B2F00', fg: '#FFD667', bd: '#584200' },
    approved: { bg: '#0D2410', fg: '#66D17A', bd: '#14351B' },
    rejected: { bg: '#2A0E0E', fg: '#FF8A8A', bd: '#3B1515' },
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.72),
    disabled: alpha(TEXT, 0.38),
  },

  divider: alpha(OUTLINE, 0.16),

  background: {
    default: '#0B0B0B',
    paper:   '#111315',
  },

  // Özel yüzey katmanları (dark)
  surface: {
    1: '#111315',
    2: '#14171A',
    3: '#1A1F24',
    4: '#22262B',
    outline: alpha(OUTLINE, 0.16),
    muted:   alpha(OUTLINE, 0.08),
  },

  // İkincil vurgu rengi (dark)
  accent: {
    main: '#F59E0B',
    light: '#FDE68A',
    dark: '#B45309',
    contrastText: '#0B0B0B',
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
