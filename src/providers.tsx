// src/providers.tsx
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { SnackbarProvider } from '@/components/ui/snackbar/useSnackbar.client';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { createAppTheme } from '@/theme';
// import { BanWatcher } from '@/components/auth/BanWatcher.client'; // userId'i bulunca aç

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const mode: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light';
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {mounted ? children : null}
    </MuiThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true, speedy: true }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        enableColorScheme
        storageKey="theme-mode"
        disableTransitionOnChange
        themes={['light', 'dark', 'system']}
      >
        <MuiThemeBridge>
          <SnackbarProvider>
            {/* <BanWatcher userId={...} /> */}
            {children}
          </SnackbarProvider>
        </MuiThemeBridge>
      </NextThemesProvider>
    </AppRouterCacheProvider>
  );
}
