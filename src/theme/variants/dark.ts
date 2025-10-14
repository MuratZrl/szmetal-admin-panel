// src/theme/variants/dark.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Koyu temada kırmızıyı daha canlı (doygun) ve koyu tutacak palet.
// Not: surface / accent / requestStatus genişletmeleri theme.d.ts içinde tanımlı.

const TEXT = '#F1F5F9';
const OUTLINE = '#9FB1BF';

export const darkPalette = {
  mode: 'dark',

  // Canlı koyu kırmızı: doygun, ama göz yakmayan bir crimson
  primary:   { main: '#E11D2E', light: '#FF6B77', dark: '#990F1A', contrastText: '#FFFFFF' },
  secondary: { main: '#8F1D22', light: '#B64A50', dark: '#5F1216', contrastText: '#FFFFFF' },

  success: { main: '#22C55E', light: '#86EFAC', dark: '#15803D', contrastText: '#0B0B0B' },
  warning: { main: '#F59E0B', light: '#FACC15', dark: '#92400E', contrastText: '#0B0B0B' },
  error:   { main: '#EF2E3A', light: '#F79AA0', dark: '#9C1C23', contrastText: '#FFFFFF' },
  info:    { main: '#06B6D4', light: '#67E8F9', dark: '#0E7490', contrastText: '#0B0B0B' },

  // Uygulama içi durum rozetleri
  requestStatus: {
    pending:  { bg: '#1B1404', fg: '#FFD667', bd: '#3A2B07' },
    approved: { bg: '#0B1C12', fg: '#73E28B', bd: '#123121' },
    rejected: { bg: '#220D0F', fg: '#FFB2B2', bd: '#3C1518' },
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.84),
    disabled: alpha(TEXT, 0.40),
  },

  divider: alpha(OUTLINE, 0.26),

  background: {
    default: '#070A0D',
    paper:   '#07090bff',
  },

  surface: {
    1: '#01050aff',
    2: '#020304ff',
    3: '#181818ff',
    4: '#000000ff',
    outline: alpha(OUTLINE, 0.22),
    muted:   alpha(OUTLINE, 0.12),
  },

  // Vurgu rengi primary ile aynı aileden, komponentlerde tutarlılık için
  accent: {
    main: '#E11D2E',
    light: '#FF6B77',
    dark:  '#990F1A',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active:             alpha(TEXT, 0.68),
    hover:              alpha('#FFFFFF', 0.10),
    selected:           alpha('#FFFFFF', 0.18),
    disabled:           alpha(TEXT, 0.36),
    disabledBackground: alpha('#FFFFFF', 0.14),
    focus:              alpha('#FFFFFF', 0.22),
  },

  contrastThreshold: 3.8,
  tonalOffset: 0.22,
} as const satisfies PaletteOptions;
