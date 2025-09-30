// src/providers.tsx
'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import type { PaletteMode } from '@mui/material';

import { createAppTheme } from '@/theme';
import { ThemeModeProvider, useThemeMode } from '@/theme/ThemeModeProvider.client';
import { SnackbarProvider } from '@/components/ui/snackbar/useSnackbar.client';

type Mode = 'light' | 'dark' | 'system';

/** 'system' -> 'light' | 'dark' çöz. İlk render’da SSR ile aynı kalması için default 'light'. */
function useResolvedPaletteMode(mode: Mode): PaletteMode {
  const [systemDark, setSystemDark] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) return;
    // İlk mount’ta gerçek sistem durumunu al
    setSystemDark(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  if (mode === 'system') return systemDark ? 'dark' : 'light';
  return mode;
}

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const paletteMode = useResolvedPaletteMode(mode); // <-- önce çöz
  const theme = React.useMemo(() => createAppTheme(paletteMode), [paletteMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}

export default function Providers({
  children,
  initialMode,
}: {
  children: React.ReactNode;
  initialMode: Mode;
}) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeModeProvider initialMode={initialMode}>
        <MuiThemeBridge>
          <SnackbarProvider>{children}</SnackbarProvider>
        </MuiThemeBridge>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
