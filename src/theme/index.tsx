// src/theme/index.ts
import * as React from 'react';
import NextLink from 'next/link';
import {
  createTheme,
  responsiveFontSizes,
  type PaletteMode,
  type Theme,
  type PaletteOptions,
} from '@mui/material/styles';

import { darkPalette } from './variants/dark';
import { lightPalette } from './variants/light';
import { componentsOverrides } from './components';

// ---- Next.js Link adapter ----
type NextLinkLikeProps = React.ComponentProps<typeof NextLink> & { children?: React.ReactNode };

export const LinkAdapter = React.forwardRef<HTMLAnchorElement, NextLinkLikeProps>(
  function LinkAdapterImpl(props, ref) {
    return <NextLink ref={ref} {...props} />;
  }
);

// ---- Tema üreticisi -------------------------------------------------------
export function createAppTheme(mode: PaletteMode): Theme {
  const tokens: PaletteOptions = mode === 'light' ? lightPalette : darkPalette;

  const base = createTheme({
    palette: { mode, ...tokens },
    shape: { borderRadius: 10 },
    typography: {
      // Google font (Inter) CSS variable -> system fallback
      fontFamily: [
        'var(--font-sans)',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
      ].join(','),

      // Başlık ve buton ağırlıkları korunuyor
      h1: { fontWeight: 700, letterSpacing: -0.5 },
      h2: { fontWeight: 700, letterSpacing: -0.4 },
      h3: { fontWeight: 700, letterSpacing: -0.2 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
  });

  const overrides = componentsOverrides(base);

  const themed = createTheme(base, {
    components: {
      ...overrides,
      MuiButtonBase: {
        ...(overrides.MuiButtonBase ?? {}),
        defaultProps: {
          ...(overrides.MuiButtonBase?.defaultProps ?? {}),
          LinkComponent: LinkAdapter,
        },
      },
      MuiLink: {
        ...(overrides.MuiLink ?? {}),
        defaultProps: {
          ...(overrides.MuiLink?.defaultProps ?? {}),
          component: LinkAdapter as unknown as React.ElementType,
        },
      },
    },
  });

  return responsiveFontSizes(themed);
}

export type AppTheme = ReturnType<typeof createAppTheme>;
export { lightPalette, darkPalette };
export { ThemeModeProvider, useThemeMode } from './ThemeModeProvider.client';
export { default as ThemeToggle } from './ThemeToggle.client';
