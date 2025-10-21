// src/theme/variants/light.ts
import { alpha, type PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

/**
 * Light ama beyaz değil: nötr-kırmızı kırpılmış yüzeyler.
 * requestStatus rozetleri ve users status renkleri tek kaynaktan gelir.
 */

const TEXT = '#0B0D10';
const OUTLINE = '#3D4552';

// Tek kaynak: kullanıcı statü renkleri
const STATUS = {
  Active:   '#15803D',
  Inactive: '#B77306',
  Banned:   '#BB1723',
} as const;

// Requests rozetleri = users status ile aynı kök renklerden türetilir
const badge = (main: string) => ({
  bg: alpha(main, 0.12), // light temada daha açık dolgu
  fg: main,              // pastel değil, ana renk
  bd: alpha(main, 0.36), // belirgin ama yormayan kenar
});

export const lightPalette = {
  mode: 'light',

  // Kurumsal kırmızı
  primary:   { main: '#A61119', light: '#E2575F', dark: '#700C10', contrastText: '#FFFFFF' },
  secondary: { main: '#6E1519', light: '#9A3A40', dark: '#470D0F', contrastText: '#FFFFFF' },

  success: { main: STATUS.Active,   light: '#86DFA6', dark: '#116636', contrastText: '#FFFFFF' },
  warning: { main: STATUS.Inactive, light: '#F1C24A', dark: '#7C4F04', contrastText: '#111111' },
  error:   { main: STATUS.Banned,   light: '#E9838B', dark: '#7E0F17', contrastText: '#FFFFFF' },
  info:    { main: '#0A7AA6', light: '#64C6E2', dark: '#0B536F', contrastText: '#FFFFFF' },

  // Requests rozetleri = Users status ile birebir hizalı
  requestStatus: {
    pending:  badge(STATUS.Inactive),
    approved: badge(STATUS.Active),
    rejected: badge(STATUS.Banned),
  },

  // Users için statü renkleri (tek kaynak)
  status: STATUS,

  charts: {
    categorical: [
      '#A61119', // primary
      '#0A7AA6', // info
      STATUS.Active,
      STATUS.Inactive,
      STATUS.Banned,
      '#6E1519', // secondary
    ] as const,
  },

  text: {
    primary: TEXT,
    secondary: alpha(TEXT, 0.70),
    disabled: alpha(TEXT, 0.46),
  },

  divider: alpha(OUTLINE, 0.50),

  // Beyaz yerine "anti-glare" açık yüzeyler (hafif sıcak kırmızı nötr)
  background: {
    default: '#F4F2F3', // ekran geneli
    paper:   '#F8F4F5', // kart/kağıt zemin
  },

  surface: {
    1: '#F8F4F5', // en açık katman
    2: '#F1ECEE',
    3: '#E9E3E6',
    4: '#E1DBDE', // tablo/header gibi alanlar
    outline: alpha(OUTLINE, 0.52),
    muted:   alpha(OUTLINE, 0.30),
  },

  accent: {
    main: '#A61119',
    light: '#E2575F',
    dark:  '#700C10',
    contrastText: '#FFFFFF',
  },

  grey,

  action: {
    active:             alpha(TEXT, 0.82),
    hover:              alpha(TEXT, 0.06),
    selected:           alpha(TEXT, 0.14),
    disabled:           alpha(TEXT, 0.46),
    disabledBackground: alpha(TEXT, 0.16),
    focus:              alpha(TEXT, 0.22),
  },

  contrastThreshold: 4.9,
  tonalOffset: 0.32,
} as const satisfies PaletteOptions;
