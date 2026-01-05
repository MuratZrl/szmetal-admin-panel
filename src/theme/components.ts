// src/theme/components.ts
import { alpha, darken } from '@mui/material/styles';
import type { Components, Theme } from '@mui/material/styles';

// DataGrid theme augmentasyonu (tipler için şart)
import '@mui/x-data-grid/themeAugmentation';

/**
 * Uygulama genelindeki MUI component overrides.
 * Not: palette.surface ve palette.accent için src/theme/types.d.ts ile Palette genişletmesi yapılmış olmalı.
 */
export const componentsOverrides = ( theme: Theme ): Components<Omit<Theme, 'components'>> => {
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
          borderRadius: 1,
          backgroundColor: alpha(palette.text.primary, 0.5),
          border: `3px solid ${palette.background.default}`,
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
          borderRadius: theme.shape.borderRadius,
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

      // ↓ yeni varyant: outlined + contrast
      variants: [
        {
          props: { variant: 'outlined', color: 'contrast' },
          style: {
            borderColor: palette.contrast.main,
            color: palette.contrast.main,
            '&:hover': {
              borderColor: palette.contrast.main,
              backgroundColor: alpha(palette.contrast.main, 0.08),
            },
            '&.Mui-disabled': {
              borderColor: alpha(palette.contrast.main, 0.24),
              color: alpha(palette.contrast.main, 0.30),
            },
          },
        },
      ],
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
      defaultProps: {
        shape: 'rounded',
        showFirstButton: true,
        showLastButton: true,
        siblingCount: 1,
        boundaryCount: 1,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiPagination-ul': {
            gap: 2,
            padding: 2,
          },
        }),
      },
    },

    MuiPaginationItem: {
      defaultProps: { shape: 'rounded' },
      styleOverrides: {
        root: ({ theme }) => {
          const { palette, shape, breakpoints, transitions } = theme;

          const accent = palette.accent?.main ?? palette.primary.main;
          const baseBorder = palette.surface.outline;

          return {
            borderRadius: shape.borderRadius,
            minWidth: 40,
            height: 40,
            padding: '0 6px',
            fontWeight: 600,
            fontSize: '0.875rem',

            color: palette.text.primary,
            backgroundColor: palette.surface[2],
            border: `1px solid ${baseBorder}`,

            transition: transitions.create(
              ['background-color', 'border-color', 'color', 'box-shadow'],
              { duration: transitions.duration.shorter }
            ),

            '&:hover': {
              backgroundColor: alpha(accent, 0.10),
              borderColor: alpha(accent, 0.50),
            },

            '&.Mui-selected': {
              backgroundColor: palette.primary.main,
              borderColor: palette.primary.main,
              color: palette.primary.contrastText,
              '&:hover': {
                backgroundColor: darken(palette.primary.main, 0.12),
                borderColor: darken(palette.primary.main, 0.12),
              },
            },

            '&.Mui-focusVisible, &:focus-visible': {
              boxShadow: `0 0 0 3px ${alpha(accent, 0.35)}`,
            },

            '&.Mui-disabled': {
              opacity: 0.55,
              color: palette.text.disabled,
              borderColor: alpha(palette.text.primary, 0.12),
              boxShadow: 'none',
            },

            '&.MuiPaginationItem-ellipsis': {
              minWidth: 24,
              height: 24,
              padding: 0,
              border: 'none',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              color: palette.text.disabled,
            },

            '&.MuiPaginationItem-previousNext, &.MuiPaginationItem-firstLast': {
              lineHeight: 0,
            },

            [breakpoints.down('sm')]: {
              minWidth: 32,
              height: 32,
              fontSize: '0.75rem',
            },
          };
        },

        icon: {
          fontSize: 20,
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
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 600,
          color: theme.palette.text.secondary,                  // default
          transition: theme.transitions.create('color'),
          '&&.Mui-focused:not(.Mui-error)': {                   // FOCUS: beyaz
            color: theme.palette.contrast.main,
          },
          '&.Mui-disabled': {                                   // DISABLED
            color: theme.palette.text.disabled,
          },
          '&.Mui-error': {                                      // ERROR: kırmızı kalsın
            color: theme.palette.error.main,
          },
        }),
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
            borderColor: palette.common,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(palette.contrast.main, 0.92),
            borderWidth: 2,
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: palette.surface.outline },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: palette.error.main },
          '&:hover.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: palette.error.main },
          '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: palette.error.main },
        },

        // ✅ placeholder rengi artık global
        input: {
          paddingTop: 12,
          paddingBottom: 12,
          '&::placeholder': {
            color: alpha(palette.text.primary, 0.35),
            opacity: 1,
          },
        },

        // ✅ multiline textarea placeholder için de
        inputMultiline: {
          '&::placeholder': {
            color: alpha(palette.text.primary, 0.35),
            opacity: 1,
          },
        },
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
          borderRadius: '100%',
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
        root: ({ theme }) => {
          const isLight = theme.palette.mode === 'light';

          const base = theme.palette.accent?.main ?? theme.palette.primary.main;
          const accentLight =
            theme.palette.accent?.light ?? (isLight ? theme.palette.primary.light : base);

          const accentDark =
            theme.palette.accent?.dark ?? darken(base, isLight ? 0.22 : 0.28);

          const aHover1 = isLight ? 0.34 : 0.14;
          const aHover2 = isLight ? 0.24 : 0.10;

          const aSel1 = isLight ? 0.48 : aHover1;
          const aSel2 = isLight ? 0.32 : aHover2;

          const aSelHover1 = isLight ? 0.58 : aHover1;
          const aSelHover2 = isLight ? 0.40 : aHover2;

          const aFocus1 = isLight ? 0.44 : 0.20;
          const aFocus2 = isLight ? 0.30 : 0.14;

          const grad = (a1: number, a2: number) =>
            `linear-gradient(135deg,
              ${alpha(accentLight, a1)} 0%,
              ${alpha(base, (a1 + a2) / 2)} 50%,
              ${alpha(accentDark, a2)} 100%
            )`;

          // ✅ İkon rengi: light’ta siyah, dark’ta mevcut secondary kalsın
          const iconColor = isLight
            ? (theme.palette.contrast?.main ?? theme.palette.text.primary) // senin light’ta #0B0B0B
            : theme.palette.text.secondary;

          return {
            // Sidebar olmayanlar (genel list davranışın)
            '&:not(.SidebarNavItemButton):hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
            },
            '&:not(.SidebarNavItemButton).Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
            '&:not(.SidebarNavItemButton).Mui-selected:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16),
            },

            // ✅ Sidebar base (normalde transparan)
            '&&.SidebarNavItemButton': {
              height: 44,
              borderRadius: theme.shape.borderRadius,
              justifyContent: 'flex-start',
              gap: 10,
              width: '100%',
              paddingLeft: theme.spacing(1.25),
              paddingRight: theme.spacing(1.25),

              backgroundColor: 'transparent',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '200% 200%',
              backgroundPosition: '0% 50%',
              border: 'none',
              boxShadow: 'none',

              // MUI default hover/selected bg’lerini sidebar için ez
              '&:hover': { backgroundColor: 'transparent' },
              '&.Mui-selected': { backgroundColor: 'transparent' },

              transition: theme.transitions.create(
                ['background-image', 'background-position', 'color', 'background-color'],
                { duration: theme.transitions.duration.shorter }
              ),

              // ✅ ikon sabit: light’ta siyah, dark’ta secondary
              '& .MuiSvgIcon-root': { color: iconColor },
            },

            // ✅ Hover: gradient (ikon rengi yine sabit)
            '&&.SidebarNavItemButton:hover': {
              backgroundImage: grad(aHover1, aHover2),
              backgroundPosition: '100% 50%',
              backgroundColor: alpha(base, 0.06),
              '& .MuiSvgIcon-root': { color: iconColor },
            },

            // ✅ Selected: gradient (ikon rengi yine sabit)
            '&&.SidebarNavItemButton.Mui-selected': {
              backgroundImage: grad(aSel1, aSel2),
              backgroundPosition: '0% 50%',
              backgroundColor: alpha(base, 0.08),
              color: theme.palette.text.primary, // metin boyanmasın
              '& .MuiSvgIcon-root': { color: iconColor },
            },

            '&&.SidebarNavItemButton.Mui-selected:hover': {
              backgroundImage: grad(aSelHover1, aSelHover2),
              backgroundPosition: '100% 50%',
              backgroundColor: alpha(base, 0.10),
              '& .MuiSvgIcon-root': { color: iconColor },
            },

            '&&.SidebarNavItemButton.Mui-focusVisible, &&.SidebarNavItemButton:focus-visible': {
              backgroundImage: grad(aFocus1, aFocus2),
              backgroundColor: alpha(base, 0.08),
              '& .MuiSvgIcon-root': { color: iconColor },
            },

            '&&.SidebarNavItemButton.Mui-disabled': {
              backgroundImage: 'none',
              backgroundColor: theme.palette.action.disabledBackground,
              '& .MuiSvgIcon-root': { color: theme.palette.text.disabled },
            },

            // compact
            '&&.SidebarNavItemButton.is-compact': {
              justifyContent: 'center',
              gap: 0,
              width: 44,
              minWidth: 44,
              paddingLeft: 0,
              paddingRight: 0,
              borderRadius: '50%',
            },
          };
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
      defaultProps: {
        arrow: true,
        placement: 'right',
        slotProps: {
          popper: {
            modifiers: [
              { name: 'offset', options: { offset: [0, 8] } },
              { name: 'flip', options: { fallbackPlacements: [] } },
            ],
          },
        },
      },
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
