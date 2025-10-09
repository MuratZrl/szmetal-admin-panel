// src/theme/variants/light.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

/**
 * Light tema — daha yüksek kontrast (güncellendi)
 * Not: surface / accent / requestStatus genişletmeleri theme.d.ts içinde tanımlı.
 */

const TEXT = '#0A0C10';     // önceki #0B0D12 → bir tık daha koyu
const OUTLINE = '#374151';  // önceki #4B5563 → çizgiler daha belirgin

export const lightPalette = {
  mode: 'light',

  // Kırmızı aile (daha koyu, daha tok)
  primary:   { main: '#C1121F', light: '#F04A55', dark: '#780D14', contrastText: '#FFFFFF' },
  secondary: { main: '#6F1318', light: '#9A3A3F', dark: '#4A0C0F', contrastText: '#FFFFFF' },

  success: { main: '#14833F', light: '#7EE2A0', dark: '#116636', contrastText: '#FFFFFF' },
  warning: { main: '#C78506', light: '#F0C442', dark: '#7A5202', contrastText: '#111111' },
  error:   { main: '#C81E2A', light: '#F28B92', dark: '#8E151D', contrastText: '#FFFFFF' },
  info:    { main: '#0AA3BF', light: '#63DBEE', dark: '#0B6E84', contrastText: '#0A0A0A' },

  // Uygulama içi durum rozetleri (kontrast artırıldı)
  requestStatus: {
    pending:  { bg: '#FFE8A3', fg: '#3D2A00', bd: '#E5B23C' },
    approved: { bg: '#D7F0DE', fg: '#0B3A16', bd: '#8FD1A0' },
    rejected: { bg: '#F8D8DC', fg: '#5D0C10', bd: '#E08B93' },
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.72), // 0.74 → ikincil metin daha net ayrışır
    disabled: alpha(TEXT, 0.50),  // 0.48 → erişilebilir disabled
  },

  divider: alpha(OUTLINE, 0.56), // 0.44 → çizgiler belirgin

  background: {
    default: '#F9FAFB',
    paper:   '#FFFFFF',
  },

  // Surface katmanları — ton farkı büyütüldü
  surface: {
    1: '#FFFFFF',
    2: '#F5F7FB',  // önceki #F7F9FC
    3: '#EBF0F6',  // önceki #EEF2F7
    4: '#E0E7F0',  // önceki #E4E9F1
    outline: alpha(OUTLINE, 0.56), // 0.48
    muted:   alpha(OUTLINE, 0.32), // 0.26
  },

  // Vurgu rengi, primary ile aynı aile (daha koyu)
  accent: {
    main: '#C1121F',
    light: '#F04A55',
    dark:  '#780D14',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active:             alpha(TEXT, 0.82),
    hover:              alpha(TEXT, 0.12),
    selected:           alpha(TEXT, 0.22),
    disabled:           alpha(TEXT, 0.50),
    disabledBackground: alpha(TEXT, 0.22),
    focus:              alpha(TEXT, 0.30),
  },

  // MUI'nin contrastText seçimlerini daha sıkı hale getir
  contrastThreshold: 5.2, // 4.5 → 5.2
  tonalOffset: 0.35,      // 0.30 → 0.35
} as const satisfies PaletteOptions;
