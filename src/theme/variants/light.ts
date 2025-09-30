// src/theme/variants/light.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

/**
 * Light tema (yüksek kontrast)
 * - Metin ve bölücüler koyulaştırıldı
 * - Hover/selected/focus opasiteleri artırıldı
 * - Yüzey katmanlarının farkı büyütüldü
 * - Kırmızı ana palet daha doygun ve keskin
 */

const TEXT = '#0F1117';
const OUTLINE = '#6B7280';

export const lightPalette = {
  mode: 'light',

  // Daha koyu ve doygun kırmızı palet (yüksek kontrast)
  primary:   { main: '#7F1115', light: '#B64A50', dark: '#4C0A0D', contrastText: '#FFFFFF' },
  secondary: { main: '#6E1A0D', light: '#9E3B27', dark: '#471008', contrastText: '#FFFFFF' },

  warning: { main: '#B4690E', light: '#D78A0D', dark: '#7A4708', contrastText: '#111111' },
  error:   { main: '#991B1B', light: '#B91C1C', dark: '#5C0D0D', contrastText: '#FFFFFF' },
  success: { main: '#16A34A', light: '#22C55E', dark: '#15803D', contrastText: '#FFFFFF' },
  info:    { main: '#0A8AAA', light: '#06B6D4', dark: '#0E7490', contrastText: '#FFFFFF' },

  // Taleplerin durumları (light) — arka plan/kenar rengi bir tık daha yüksek kontrast
  requestStatus: {
    pending:  { bg: '#FFE8AE', fg: '#6B4500', bd: '#FFC76B' },
    approved: { bg: '#DFF4E4', fg: '#155B23', bd: '#BEE3C3' },
    rejected: { bg: '#F9D7DA', fg: '#7A1C1C', bd: '#EFA9B0' },
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.88),
    disabled: alpha(TEXT, 0.40),
  },

  // Bölücüler daha belirgin
  divider: alpha(OUTLINE, 0.34),

  // Arka planlar arası fark daha belirgin: sayfa hafif gri, kağıt beyaz
  background: {
    default: '#F5F7FA',
    paper:   '#FFFFFF',
  },

  // Özel yüzey katmanları — kontrast farkı büyütüldü
  surface: {
    1: '#F5F7FA',
    2: '#FFFFFF',
    3: '#EDF1F6',
    4: '#E2E8F0',
    outline: alpha(OUTLINE, 0.36),
    muted:   alpha(OUTLINE, 0.18),
  },

  // Kırmızı vurgu: daha canlı
  accent: {
    main: '#B0151B',
    light: '#E23C44',
    dark: '#7F0F13',
    contrastText: '#FFFFFF',
  },

  grey,

  // Etkileşim durumları — hover/selected/focus opasiteleri yükseltildi
  action: {
    active:             alpha(TEXT, 0.64),
    hover:              alpha(TEXT, 0.08),
    selected:           alpha(TEXT, 0.16),
    disabled:           alpha(TEXT, 0.38),
    disabledBackground: alpha(TEXT, 0.14),
    focus:              alpha(TEXT, 0.18),
  },

  // Kontrast ayarları
  contrastThreshold: 3.25,
  tonalOffset: 0.28,
} as const satisfies PaletteOptions;
