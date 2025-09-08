// src/theme/components.ts
import { alpha, darken } from '@mui/material/styles';
import type { Components, Theme } from '@mui/material/styles';
// DataGrid theme augmentasyonu (tipler için şart)
import '@mui/x-data-grid/themeAugmentation';

/**
 * Uygulama genelindeki MUI component overrides.
 * Not: palette.surface ve palette.accent için src/theme/types.d.ts ile Palette genişletmesi yapılmış olmalı.
 */
export const componentsOverrides = (
  theme: Theme
): Components<Omit<Theme, 'components'>> => {
  const { palette, shape, breakpoints } = theme;

  return {
    /* -------------------- Global baseline -------------------- */
    MuiCssBaseline: {
      styleOverrides: {

        ':root': {
          // surface değişkenleri
          '--rs-surface-1': palette.surface[1],
          '--rs-surface-2': palette.surface[2],
          '--rs-surface-3': palette.surface[3],
          '--rs-surface-4': palette.surface[4],
          '--rs-outline':   palette.surface.outline,
          '--rs-muted':     palette.surface.muted,

          // border radius değişkeni (MUI’nin kendi --mui- değişkenine güvenmeyelim)
          '--rs-radius': `${shape.borderRadius}px`,
        },

        '*, *::before, *::after': { boxSizing: 'border-box' },
        
        html: { height: '100%' },
        
        body: {
          height: '100%',
          backgroundColor: palette.background.default,
          color: palette.text.primary,
        },
        
        '::selection': {
          background: alpha(palette.primary.main, 0.24),
        },
        
        /* Scrollbar (Webkit) */
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(palette.text.primary, 0.24),
          borderRadius: 999,
          border: `2px solid ${palette.background.default}`,
        },
        
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: alpha(palette.text.primary, 0.38),
        },
      },
    },

    /* -------------------- Buttons -------------------- */
    MuiButtonBase: {
      defaultProps: { disableRipple: false },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          fontWeight: 600,
          textTransform: 'none',
        },
        sizeSmall: { padding: '4px 10px' },
        containedPrimary: {
          color: palette.primary.contrastText,
          backgroundColor: palette.primary.main,
          '&:hover': { backgroundColor: darken(palette.primary.main, 0.12) },
          '&:active': { backgroundColor: darken(palette.primary.main, 0.18) },
        },
        outlinedPrimary: {
          borderColor: alpha(palette.primary.main, 0.48),
          color: palette.primary.main,
          '&:hover': {
            borderColor: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.06),
          },
        },
        textPrimary: {
          color: palette.primary.main,
          '&:hover': { backgroundColor: alpha(palette.primary.main, 0.06) },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          '&:hover': { backgroundColor: alpha(palette.primary.main, 0.06) },
        },
      },
    },

    /* -------------------- Pagination -------------------- */
    MuiPagination: {
      defaultProps: { shape: 'rounded', showFirstButton: true, showLastButton: true },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          color: palette.primary.main,
          fontSize: '0.875rem',
          minWidth: 36,
          height: 36,
          [breakpoints.down('sm')]: { fontSize: '0.75rem', minWidth: 28, height: 28 },
          '&.Mui-selected': {
            backgroundColor: palette.primary.main,
            color: palette.primary.contrastText,
            '&:hover': { backgroundColor: darken(palette.primary.main, 0.14) },
          },
        },
      },
    },

    /* -------------------- Navigation (AppBar / Tabs) -------------------- */
    MuiAppBar: {
      defaultProps: { color: 'default' },
      styleOverrides: {
        root: {
          backgroundColor: palette.surface[2],
          color: palette.text.primary,
          borderBottom: `1px solid ${palette.surface.outline}`,
          boxShadow: 'none',
        },
      },
    },
    
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
          [breakpoints.down('sm')]: { minHeight: 56 },
        },
      },
    },

    MuiTabs: {
      defaultProps: { indicatorColor: 'primary', textColor: 'primary' },
      styleOverrides: {
        root: { minHeight: 40 },
        indicator: {
          height: 3,
          borderRadius: 3,
        },
      },
    },
    
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          textTransform: 'none',
          fontWeight: 600,
          '&.Mui-selected': { color: palette.primary.main },
        },
      },
    },

    /* -------------------- Inputs & Forms -------------------- */
    MuiFormLabel: {
      styleOverrides: {
        asterisk: { color: palette.error.main },
      },
    },

    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          backgroundColor: palette.surface[2],
          transition: theme.transitions.create(['border-color', 'box-shadow']),
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.surface.outline,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main,
            borderWidth: 2,
          },
        },
        input: { paddingTop: 12, paddingBottom: 12 },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        InputLabelProps: { shrink: true },
        fullWidth: true,
      },
    },

    MuiSelect: {
      styleOverrides: {
        icon: { color: palette.text.secondary },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: { marginLeft: 0 },
      },
    },

    MuiCheckbox: {
      defaultProps: { color: 'primary' },
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:hover': { backgroundColor: alpha(palette.primary.main, 0.06) },
        },
      },
    },

    MuiRadio: {
      defaultProps: { color: 'primary' },
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: alpha(palette.primary.main, 0.06) },
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 48,
          height: 28,
          padding: 0,
        },
        switchBase: {
          padding: 3,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: palette.primary.contrastText,
            '& + .MuiSwitch-track': {
              backgroundColor: palette.primary.main,
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 22,
          height: 22,
          boxShadow: 'none',
          border: `1px solid ${alpha(palette.common.black, 0.06)}`,
        },
        track: {
          borderRadius: 28,
          backgroundColor: alpha(palette.text.primary, 0.24),
          opacity: 1,
        },
      },
    },
    
    MuiSlider: {
      styleOverrides: {
        rail: { opacity: 0.32 },
        track: { height: 6 },
        thumb: { width: 16, height: 16 },
      },
    },

    /* -------------------- Surfaces (Paper / Card / Divider) -------------------- */
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: palette.surface[2],
          backgroundImage: 'none',
          borderRadius: shape.borderRadius,
        },
        outlined: {
          borderColor: palette.surface.outline,
          backgroundColor: palette.surface[2],
        },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: palette.surface[1],
          borderRadius: shape.borderRadius,
          border: `1px solid ${palette.surface.outline}`,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: palette.surface.outline },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
        filled: { backgroundColor: palette.surface[3] },
        colorPrimary: {
          backgroundColor: alpha(palette.primary.main, 0.12),
          color: palette.primary.main,
        },
        outlined: {
          borderColor: palette.surface.outline,
          backgroundColor: palette.surface[2],
        },
      },
    },

    /* -------------------- Lists / Drawer / Menus -------------------- */
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.surface[1],
          borderRight: `1px solid ${theme.palette.surface.outline}`,
          paddingTop: theme.spacing(3.5),
          paddingBottom: theme.spacing(3.5),
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,            // ← ekle
        }),
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: alpha(palette.primary.main, 0.06) },
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary.main, 0.12),
            '&:hover': { backgroundColor: alpha(palette.primary.main, 0.16) },
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: { root: { minWidth: 36, color: palette.text.secondary } },
    },

    MuiMenu: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        paper: {
          borderRadius: 10,
          backgroundColor: palette.surface[2],
          border: `1px solid ${palette.surface.outline}`,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': { backgroundColor: alpha(palette.primary.main, 0.06) },
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary.main, 0.12),
            '&:hover': { backgroundColor: alpha(palette.primary.main, 0.16) },
          },
        },
      },
    },

    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: `1px solid ${palette.surface.outline}`,
          backgroundColor: palette.surface[2],
        },
      },
    },
    
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: { color: palette.text.disabled },
      },
    },

    /* -------------------- Feedback (Dialog / Snackbar / Alert / Tooltip) -------------------- */
    MuiDialog: {
      defaultProps: { fullWidth: true, maxWidth: 'md' },
      styleOverrides: {
        paper: {
          borderRadius: 14,
          backgroundColor: palette.surface[1],
          border: `1px solid ${palette.surface.outline}`,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: { fontWeight: 700, paddingBottom: 8 },
      },
    },

    MuiDialogContent: {
      styleOverrides: { root: { paddingTop: 8 } },
    },

    MuiDialogActions: {
      styleOverrides: { root: { padding: 16 } },
    },

    MuiSnackbar: {
      defaultProps: { anchorOrigin: { vertical: 'bottom', horizontal: 'right' } },
    },

    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: palette.grey[900],
          color: palette.getContrastText(palette.grey[900]),
          border: `1px solid ${alpha(palette.common.white, 0.08)}`,
        },
      },
    },

    MuiAlert: {
      defaultProps: { variant: 'filled' },
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600 },
        filledSuccess: {
          backgroundColor: palette.success.main,
          color: palette.success.contrastText ?? palette.common.white,
        },
        filledError: {
          backgroundColor: palette.error.main,
          color: palette.error.contrastText ?? palette.common.white,
        },
        filledWarning: {
          backgroundColor: palette.warning.main,
          color: palette.warning.contrastText ?? palette.common.black,
        },
        filledInfo: {
          backgroundColor: palette.info.main,
          color: palette.info.contrastText ?? palette.common.white,
        },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.grey[900],
          color: palette.getContrastText(palette.grey[900]),
          fontSize: 12,
        },
        arrow: { color: palette.grey[900] },
      },
    },

    /* -------------------- Tables -------------------- */
    MuiTable: {
      styleOverrides: {
        root: {
          '& th, & td': { borderColor: palette.surface.outline },
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 700,
            backgroundColor: palette.surface[3],
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        hover: {
          '&:hover': { backgroundColor: alpha(palette.primary.main, 0.04) },
        },
        head: { height: 52 },
        root: { height: 52 },
      },
    },

    /* -------------------- DataGrid (@mui/x-data-grid) -------------------- */
    MuiDataGrid: {
      defaultProps: {
        disableRowSelectionOnClick: true,
        rowSelection: false,
        autoHeight: true,
      },

      styleOverrides: {
        root: {
          border: `1px solid ${palette.surface.outline}`,
          borderRadius: shape.borderRadius,
          backgroundColor: palette.surface[2],
          '--DataGrid-rowBorderColor': palette.surface.outline,
        },
        columnHeaders: {
          backgroundColor: palette.surface[3],
          borderBottom: `1px solid ${palette.surface.outline}`,
          fontWeight: 700,
        },
        columnHeader: {
          '&:focus, &:focus-within': { outline: 'none' },
        },
        cell: {
          borderColor: palette.surface.outline,
          '&:focus, &:focus-within': { outline: 'none' },
        },
        row: {
          '&:hover': { backgroundColor: alpha(palette.primary.main, 0.04) },
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary.main, 0.08),
            '&:hover': { backgroundColor: alpha(palette.primary.main, 0.12) },
          },
        },
        footerContainer: {
          borderTop: `1px solid ${palette.surface.outline}`,
          backgroundColor: palette.surface[2],
        },
      },
    },

    /* -------------------- Misc -------------------- */
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: alpha(palette.primary.main, 0.12),
          color: palette.primary.main,
          fontWeight: 700,
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          border: `2px solid ${palette.background.paper}`,
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },

    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { color: palette.primary.main, fontWeight: 600 } },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: shape.borderRadius,
          backgroundColor: palette.surface[1],
          border: `1px solid ${palette.surface.outline}`,
          '&:before': { display: 'none' },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: palette.surface[2],
          '&.Mui-expanded': { minHeight: 48 },
        },
        content: {
          margin: '12px 0',
          '&.Mui-expanded': { margin: '12px 0' },
          fontWeight: 600,
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: { root: { paddingTop: 8 } },
    },
  };
};
