// src/theme.ts
'use client';

import { createTheme, responsiveFontSizes, alpha, type ThemeOptions } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// --- Ruby Sand paleti
const RS = {
  primary: '#EF4444',    // kırmızı
  secondary: '#F97316',  // turuncu
  warning: '#F59E0B',    // amber
  error: '#DC2626',
  success: '#22C55E',
  info: '#06B6D4',
  bg: '#0F0F0F',
  surface: '#1A1A1A',
  text: '#F3F4F6',
} as const;

const GREY = {
  50:  '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

// --- MUI module augmentation
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    surface: {
      1: string;
      2: string;
      3: string;
      4: string;
      outline: string;
      muted: string;
    };
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    surface?: Partial<Palette['surface']>;
  }

  interface TypeBackground {
    default: string;
    paper: string;
    elevated?: string;
  }

  interface Theme {
    customShadows: {
      sm: string;
      md: string;
      lg: string;
      inset: string;
      glowPrimary: string;
    };
    gradients: {
      primary: string;
      header: string;
    };
  }
  interface ThemeOptions {
    customShadows?: Theme['customShadows'];
    gradients?: Theme['gradients'];
  }
}

// --- Tema seçenekleri
const base: ThemeOptions = {
  cssVariables: true, // yeni: CSS theme vars
  palette: {
    mode: 'dark',
    primary: {
      main: RS.primary,
      light: '#F87171',
      dark: '#B91C1C',
      contrastText: RS.text,
    },
    secondary: {
      main: RS.secondary,
      light: '#FB923C',
      dark: '#C2410C',
      contrastText: RS.text,
    },
    warning: {
      main: RS.warning,
      light: '#FACC15',
      dark: '#B45309',
      contrastText: '#0B0F14',
    },
    error: {
      main: RS.error,
      light: '#F87171',
      dark: '#991B1B',
      contrastText: RS.text,
    },
    success: {
      main: RS.success,
      light: '#4ADE80',
      dark: '#15803D',
      contrastText: '#0B0F14',
    },
    info: {
      main: RS.info,
      light: '#67E8F9',
      dark: '#0E7490',
      contrastText: '#0B0F14',
    },
    text: {
      primary: RS.text,
      secondary: alpha(RS.text, 0.72),
      disabled: alpha(RS.text, 0.38),
    },
    divider: alpha(GREY[400], 0.18),
    background: {
      default: RS.bg,
      paper: RS.surface,
      elevated: '#121212',
    },
    // custom yüzeyler
    surface: {
      1: RS.surface,
      2: '#161616',
      3: '#141414',
      4: '#121212',
      outline: alpha(GREY[300], 0.16),
      muted: alpha(GREY[300], 0.08),
    },
    accent: {
      main: '#F59E0B',
      light: '#FDE68A',
      dark: '#B45309',
      contrastText: '#0B0F14',
    },
    grey: GREY,
    action: {
      active: alpha(RS.text, 0.56),
      hover: alpha(RS.text, 0.08),
      selected: alpha(RS.text, 0.12),
      disabled: alpha(RS.text, 0.3),
      disabledBackground: alpha(RS.text, 0.12),
      focus: alpha(RS.text, 0.16),
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },

  shape: { borderRadius: 4 },

  typography: {
    // Next font değişkeni
    fontFamily: 'var(--font-roboto), Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    h1: { fontWeight: 700, fontSize: '3rem', lineHeight: 1.1 },
    h2: { fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.15 },
    h3: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.2 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.25 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.3 },
    h6: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.35 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0.2 },
    caption: { opacity: 0.85 },
    overline: { letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 },
  },

  customShadows: {
    sm: `0 1px 2px ${alpha('#000', 0.5)}`,
    md: `0 6px 20px ${alpha('#000', 0.45)}`,
    lg: `0 12px 40px ${alpha('#000', 0.5)}`,
    inset: `inset 0 1px 0 ${alpha('#fff', 0.04)}, inset 0 0 0 1px ${alpha('#fff', 0.03)}`,
    glowPrimary: `0 0 0 3px ${alpha(RS.primary, 0.3)}, 0 0 24px ${alpha(RS.secondary, 0.25)}`,
  },

  gradients: {
    primary: `linear-gradient(135deg, ${RS.primary} 0%, ${RS.secondary} 60%, ${RS.warning} 100%)`,
    header: `linear-gradient(180deg, ${alpha(RS.primary, 0.12)} 0%, transparent 60%)`,
  },

  components: {

    // 1) Drawer: sidebar kağıdı
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === 'dark'
              ? '#000' // dark: gerçek siyah
              : theme.palette.surface?.[2] ?? theme.palette.background.paper, // light: açık yüzey
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.surface?.outline}`,
          width: 72,                  // <<< sabitledik
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBlock: theme.spacing(3),
          boxShadow: 'none',
        }),
      },
    },
    
    // 2) ListItem: padding sıfır, içerik ortalı
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: 0,
          justifyContent: 'center',
        },
      },
    },

    // 3) ListItemButton: nav butonu
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          // diğer genel ufak dokunuşlar burada kalabilir
          // ...

          // SADECE Sidebar içindeki nav butonları etkilensin:
          '&.SidebarNavButton': {
            justifyContent: 'center',
            borderRadius: 12,
            width: 48,
            height: 48,
            position: 'relative',
            overflow: 'hidden',
            color: theme.palette.text.secondary,
            transition: 'transform 150ms ease, color 200ms ease',

            '& svg, & .MuiSvgIcon-root': {
              position: 'relative',
              zIndex: 2,
              transition: 'color 200ms ease',
              color: 'inherit',
            },

            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, #7f1d1d 0%, #3b0000 100%)'
                  : 'linear-gradient(180deg, rgba(239,68,68,0.92) 0%, rgba(249,115,22,0.92) 100%)',
              opacity: 0,
              transition: 'opacity 220ms ease',
              pointerEvents: 'none',
            },

            '&:hover': {
              '&::before': { opacity: 1 },
              '& svg, & .MuiSvgIcon-root': { color: theme.palette.common.white },
            },

            '&.Mui-selected, &.Mui-selected:hover': {
              transform: 'translateY(-1px)',
              color: theme.palette.common.white,
              '&::before': { opacity: 1 },
              '& svg, & .MuiSvgIcon-root': { color: theme.palette.common.white },
            },

            '&.Mui-focusVisible': {
              outline: `2px solid ${alpha(theme.palette.primary.main, 0.35)}`,
              outlineOffset: 2,
            },

            '&.Mui-disabled': {
              opacity: 0.35,
              pointerEvents: 'none',
            },
          },
        }),
      },
    },

    // 4) Tooltip: sidebar uyumlu
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[800],
          color: theme.palette.common.white,
          border: '1px solid',
          borderColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[600],
          boxShadow: theme.shadows[6],
          fontSize: '0.8125rem',
        }),
        arrow: ({ theme }) => ({
          color:
            theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[800],
        }),
      },
    },

    MuiCssBaseline: {
      styleOverrides: (theme: Theme) => ({
        ':root': {
          '--rs-surface-1': theme.palette.surface?.[1],
          '--rs-surface-2': theme.palette.surface?.[2],
          '--rs-surface-3': theme.palette.surface?.[3],
          '--rs-surface-4': theme.palette.surface?.[4],
        },
        'html, body, #__next': { height: '100%' },
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          backgroundImage: theme.gradients?.header,
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.text.primary, 0.18),
          borderRadius: 8,
          border: `2px solid ${theme.palette.background.default}`,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: alpha(theme.palette.text.primary, 0.28),
        },
      }),
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backgroundColor: theme.palette.surface?.[1],
          border: `1px solid ${theme.palette.surface?.outline}`,
          boxShadow: theme.customShadows?.sm,
        }),
        rounded: { borderRadius: 16 },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.surface?.[2],
          borderRadius: 4,
          border: `1px solid ${theme.palette.surface?.outline}`,
          boxShadow: theme.customShadows?.md,
        }),
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.surface?.[1] ?? RS.surface, 0.9),
          backdropFilter: 'saturate(120%) blur(8px)',
          borderBottom: `1px solid ${theme.palette.surface?.outline}`,
        }),
      },
    },

    MuiToolbar: {
      styleOverrides: { root: { minHeight: 64 } },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 700,
          '&.Mui-disabled': {
            backgroundImage: 'none',
            backgroundColor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.25) // koyu zeminde soluk kırmızı
                : theme.palette.action.disabledBackground,
            color:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.5) // yazı soluk beyaz
                : theme.palette.action.disabled,
            boxShadow: 'none',
          },
        }),
        containedPrimary: ({ theme }) => ({
          backgroundImage: theme.gradients?.primary,
          boxShadow: theme.customShadows?.glowPrimary,
          ':hover': {
            filter: 'brightness(1.04)',
            boxShadow: theme.customShadows?.glowPrimary,
          },
          '&.Mui-disabled': {
            backgroundImage: 'none',
            backgroundColor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.25) // koyu kırmızımsı arka plan
                : alpha(theme.palette.primary.main, 0.3),
            color:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.5) // dark’ta beyazı kıs
                : alpha(theme.palette.common.white, 0.7),
            boxShadow: 'none',
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.surface?.outline,
          ':hover': {
            borderColor: alpha(theme.palette.text.primary, 0.5),
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
          },
          '&.Mui-disabled': {
            borderColor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.25)
                : theme.palette.action.disabledBackground,
            color:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.4)
                : theme.palette.action.disabled,
          },
        }),
      },
    },

    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
        }),
        colorSecondary: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.secondary.main, 0.12),
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
        }),
      },
    },

    MuiTextField: {
      defaultProps: { 
        variant: 'outlined', 
        size: 'small',
       },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: alpha('#000', 0.2) },  
        notchedOutline: ({ theme }) => ({ borderColor: theme.palette.surface?.outline }),
        input: { '::placeholder': { opacity: 0.7 } },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          height: 3,
          borderRadius: 1,
          background: theme.palette.primary.main,
        }),
      },
    },

    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },

    // @mui/x-data-grid
    MuiDataGrid: {
      styleOverrides: (theme: Theme) => ({
        root: {
          border: `1px solid ${theme.palette.surface?.outline}`,
          backgroundColor: theme.palette.surface?.[1],
        },
        columnHeaders: {
          backgroundColor: theme.palette.surface?.[2],
          borderBottom: `1px solid ${theme.palette.surface?.outline}`,
        },
        row: {
          '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.03) },
        },
        cell: {
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        },
      }),
    },
  },

  spacing: 8,
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
};

let theme = createTheme(base);
theme = responsiveFontSizes(theme, { factor: 2.6 });

export default theme;
