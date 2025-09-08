// app/(admin)/providers.tsx
'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from '@/theme';
import { SnackbarProvider } from '@/components/ui/snackbar/useSnackbar.client';

function ClientReady({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    // Eski kayıt 'system' ise sil
    if (typeof window !== 'undefined' && localStorage.getItem('theme-mode') === 'system') {
      localStorage.removeItem('theme-mode');
    }
    setReady(true);
  }, []);
  if (!ready) return null;
  return <>{children}</>;
}

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const mode: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light';
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true, speedy: true }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={false}
        storageKey="theme-mode"
        disableTransitionOnChange
      >
        <ClientReady>
          <MuiThemeBridge>
            <SnackbarProvider>{children}</SnackbarProvider>
          </MuiThemeBridge>
        </ClientReady>
      </NextThemesProvider>
    </AppRouterCacheProvider>
  );
}
