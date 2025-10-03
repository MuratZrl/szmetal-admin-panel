// src/theme/variants/light.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

/**
 * Light tema — daha yüksek kontrast
 * Not: surface / accent / requestStatus genişletmeleri theme.d.ts içinde tanımlı.
 */

const TEXT = '#0B0D12';     // önceki #0F1117 → daha koyu
const OUTLINE = '#4B5563';  // önceki #6B7280 → çizgiler daha net

export const lightPalette = {
  mode: 'light',

  // Kırmızı aile (marka tutarlılığı korunur)
  primary:   { main: '#E11D2E', light: '#FF5E6B', dark: '#8C0F19', contrastText: '#FFFFFF' },
  secondary: { main: '#8F1D22', light: '#B64A50', dark: '#5F1216', contrastText: '#FFFFFF' },

  success: { main: '#16A34A', light: '#86EFAC', dark: '#15803D', contrastText: '#FFFFFF' },
  warning: { main: '#F59E0B', light: '#FCD34D', dark: '#92400E', contrastText: '#111111' },
  error:   { main: '#EF2E3A', light: '#F79AA0', dark: '#9C1C23', contrastText: '#FFFFFF' },
  info:    { main: '#06B6D4', light: '#67E8F9', dark: '#0E7490', contrastText: '#0A0A0A' },

  // Uygulama içi durum rozetleri (kontrast artırıldı)
  requestStatus: {
    pending:  { bg: '#FFF1C2', fg: '#5B3B00', bd: '#FFCD62' },
    approved: { bg: '#E6F6EA', fg: '#0F5220', bd: '#B6E2BF' },
    rejected: { bg: '#FBE5E7', fg: '#6E1115', bd: '#F3A5AC' },
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.74), // önceki 0.88 → gerçek “secondary”
    disabled: alpha(TEXT, 0.48),  // 0.40 → erişilebilir disabled
  },

  divider: alpha(OUTLINE, 0.44), // 0.34 → çizgiler belirgin

  background: {
    default: '#F9FAFB', // daha aydınlık zemin
    paper:   '#FFFFFF',
  },

  // Surface katmanları — adım farkları büyütüldü
  surface: {
    1: '#FFFFFF',
    2: '#F7F9FC',
    3: '#EEF2F7',
    4: '#E4E9F1',
    outline: alpha(OUTLINE, 0.48),
    muted:   alpha(OUTLINE, 0.26),
  },

  // Vurgu rengi, primary ile aynı aile
  accent: {
    main: '#E11D2E',
    light: '#FF5E6B',
    dark:  '#8C0F19',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active:             alpha(TEXT, 0.74), // ikon/metin aktifliği daha görünür
    hover:              alpha(TEXT, 0.10), // 0.08 → hover biraz daha hissedilir
    selected:           alpha(TEXT, 0.20), // 0.16 → seçili arka plan net
    disabled:           alpha(TEXT, 0.45),
    disabledBackground: alpha(TEXT, 0.20),
    focus:              alpha(TEXT, 0.26),
  },

  // MUI'nin contrastText seçimlerini daha sıkı hale getir
  contrastThreshold: 4.5,
  tonalOffset: 0.30,
} as const satisfies PaletteOptions;
