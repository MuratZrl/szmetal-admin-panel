// src/theme-light.ts
'use client';

import { createTheme, responsiveFontSizes, alpha, type ThemeOptions } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// --- Ruby Sand (Light) paleti
const RS = {
  primary: '#EF4444',   // kırmızı
  secondary: '#F97316', // turuncu
  warning: '#F59E0B',   // amber
  error: '#DC2626',
  success: '#22C55E',
  info: '#06B6D4',
  bg: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
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

// --- Tema seçenekleri (LIGHT)
const base: ThemeOptions = {
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: RS.primary,
      light: '#F87171',
      dark: '#B91C1C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: RS.secondary,
      light: '#FB923C',
      dark: '#C2410C',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: RS.warning,
      light: '#FACC15',
      dark: '#B45309',
      contrastText: '#111111',
    },
    error: {
      main: RS.error,
      light: '#F87171',
      dark: '#991B1B',
      contrastText: '#FFFFFF',
    },
    success: {
      main: RS.success,
      light: '#4ADE80',
      dark: '#15803D',
      contrastText: '#FFFFFF',
    },
    info: {
      main: RS.info,
      light: '#67E8F9',
      dark: '#0E7490',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: RS.text,
      secondary: alpha(RS.text, 0.72),
      disabled: alpha(RS.text, 0.38),
    },
    divider: alpha(GREY[400], 0.2),
    background: {
      default: RS.bg,
      paper: RS.surface,
      elevated: '#FAFAFA',
    },
    // custom yüzeyler
    surface: {
      1: RS.surface,       // kart/paper tabanı
      2: '#FFFFFF',      // daha açık seviye
      3: '#F3F4F6',
      4: '#E5E7EB',
      outline: alpha(GREY[400], 0.28),
      muted: alpha(GREY[400], 0.14),
    },
    accent: {
      main: '#F59E0B',
      light: '#FDE68A',
      dark: '#B45309',
      contrastText: '#111111',
    },
    grey: GREY,
    action: {
      active: alpha(RS.text, 0.56),
      hover: alpha(RS.text, 0.06),
      selected: alpha(RS.text, 0.10),
      disabled: alpha(RS.text, 0.30),
      disabledBackground: alpha(RS.text, 0.10),
      focus: alpha(RS.text, 0.12),
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },

  shape: { borderRadius: 4 },

  typography: {
    fontFamily:
      'var(--font-roboto), Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
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
    sm: `0 1px 2px ${alpha('#000', 0.08)}`,
    md: `0 6px 20px ${alpha('#000', 0.12)}`,
    lg: `0 12px 40px ${alpha('#000', 0.15)}`,
    inset: `inset 0 1px 0 ${alpha('#000', 0.04)}, inset 0 0 0 1px ${alpha('#000', 0.06)}`,
    glowPrimary: `0 0 0 3px ${alpha(RS.primary, 0.24)}, 0 0 24px ${alpha(RS.secondary, 0.22)}`,
  },

  gradients: {
    primary: `linear-gradient(135deg, ${RS.primary} 0%, ${RS.secondary} 60%, ${RS.warning} 100%)`,
    header: `linear-gradient(180deg, ${alpha(RS.primary, 0.08)} 0%, transparent 60%)`,
  },

  components: {
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
          background: alpha(theme.palette.text.primary, 0.26),
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

    // 1) Drawer: sidebar kağıdı ve ölçüler
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.surface?.[2],
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.surface?.outline}`,
          width: 72,                             // <<< genişliği sabitledik
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBlock: theme.spacing(3),
          boxShadow: 'none',
        }),
      },
    },

    // 2) ListItem: padding sıfır, ortalı
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: 0,
          justifyContent: 'center',
        },
      },
    },

    // 3) ListItemButton: nav butonu (hover/selected gradyan + focus ring)
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Sadece Sidebar'da geçerli olsun:
          '&.SidebarNavButton': {
            justifyContent: 'center',
            borderRadius: 12,
            width: 48,
            height: 48,
            position: 'relative',
            overflow: 'hidden',
            color: theme.palette.text.secondary,
            transition: 'transform 150ms ease, color 200ms ease',

            // ikonlar
            '& svg, & .MuiSvgIcon-root': {
              position: 'relative',
              zIndex: 2,
              transition: 'color 200ms ease',
              color: 'inherit',
            },

            // gradyan katmanı (light için daha parlak)
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background:
                'linear-gradient(180deg, rgba(239,68,68,0.92) 0%, rgba(249,115,22,0.92) 100%)',
              opacity: 0,
              transition: 'opacity 220ms ease',
              pointerEvents: 'none',
            },

            // hover: gradyan + ikon beyaz
            '&:hover': {
              '&::before': { opacity: 1 },
              '& svg, & .MuiSvgIcon-root': { color: theme.palette.common.white },
            },

            // selected: kalıcı gradyan + hafif yükselme + ikon beyaz
            '&.Mui-selected, &.Mui-selected:hover': {
              transform: 'translateY(-1px)',
              color: theme.palette.common.white,
              '&::before': { opacity: 1 },
              '& svg, & .MuiSvgIcon-root': { color: theme.palette.common.white },
            },

            // klavye erişilebilirliği
            '&.Mui-focusVisible': {
              outline: `2px solid ${alpha(theme.palette.primary.main, 0.35)}`,
              outlineOffset: 2,
            },

            // disabled
            '&.Mui-disabled': {
              opacity: 0.35,
              pointerEvents: 'none',
            },
          },
        }),
      },
    },

    // 4) Tooltip: sidebar uyumlu görünüm + ok rengi
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.surface?.[3],
          border: `1px solid ${theme.palette.surface?.outline}`,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[2],
          fontSize: '0.8125rem',
        }),
        arrow: ({ theme }) => ({
          color: theme.palette.surface?.[3],
        }),
      },
    },

    // 5) Badge: küçük rozet daha net
    MuiBadge: {
      styleOverrides: {
        badge: ({ theme }) => ({
          fontWeight: 700,
          transform: 'scale(.95)',
          border: `1px solid ${theme.palette.background.paper}`,
        }),
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 700,
          // global disabled override
          '&.Mui-disabled': {
            backgroundImage: 'none', // gradienti iptal
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
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
            backgroundImage: 'none', // gradienti kaldır
            backgroundColor: alpha(theme.palette.primary.main, 0.3), // daha soft kırmızı ton
            color: alpha(theme.palette.common.white, 0.7),            // yazı rengi kısık beyaz
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
            borderColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
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
        root: { backgroundColor: alpha('#000', 0.02) },
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
          '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.04) },
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
