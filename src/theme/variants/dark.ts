// src/theme/variants/dark.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// Koyu ama bir tık daha aydınlık kırmızı palet
const TEXT = '#F3F4F6';
const OUTLINE = '#93A4B0';

export const darkPalette = {
  mode: 'dark',

  // Brand renkler aynı; tema "karanlık ama boğuk değil"
  primary:   { main: '#C21F25', light: '#ddbabcff', dark: '#7A1216', contrastText: '#FFFFFF' },
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
    secondary: alpha(TEXT, 0.82), // 0.78 → 0.82, biraz daha okunaklı
    disabled: alpha(TEXT, 0.40),
  },

  // Bölücüler hafifçe belirgin
  divider: alpha(OUTLINE, 0.22), // 0.18 → 0.22

  // Arka planlar yarım ton aydınlık
  background: {
    default: '#0D0F12', // #0A0A0A → #0D0F12
    paper:   '#14171B', // #111214 → #14171B
  },

  // Yüzey katmanları da bir tık açıldı
  surface: {
    1: '#14171B', // #111214 → #14171B
    2: '#1A1F24', // #16181B → #1A1F24
    3: '#20262C', // #1B2024 → #20262C
    4: '#2A3138', // #23272C → #2A3138
    outline: alpha(OUTLINE, 0.18), // 0.16 → 0.18
    muted:   alpha(OUTLINE, 0.10), // 0.08 → 0.10
  },

  // Accent aynı; kontrast korunsun
  accent: {
    main: '#C6252B',
    light: '#E0474E',
    dark:  '#8A181D',
    contrastText: '#FFFFFF',
  },

  grey,

  // Etkileşim durumları azıcık belirgin
  action: {
    active:             alpha(TEXT, 0.58), // 0.56 → 0.58
    hover:              alpha(TEXT, 0.08), // 0.07 → 0.08
    selected:           alpha(TEXT, 0.14), // 0.12 → 0.14
    disabled:           alpha(TEXT, 0.32),
    disabledBackground: alpha(TEXT, 0.12), // 0.11 → 0.12
    focus:              alpha(TEXT, 0.14), // 0.12 → 0.14
  },

  contrastThreshold: 3,
  tonalOffset: 0.2,
} as const satisfies PaletteOptions;
