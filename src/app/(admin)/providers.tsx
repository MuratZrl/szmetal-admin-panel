// app/(admin)/providers.tsx
'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import darkTheme from '@/theme';        // theme.ts (dark)
import lightTheme from '@/theme-light'; // theme-light.ts (light)

// ✅ EKLE: SnackbarProvider
import { SnackbarProvider } from '@/components/ui/snackbar/useSnackbar.client';

function ThemeBridge({ children }: { children: React.ReactNode }) {
  // next-themes tarafa kulak ver
  const { resolvedTheme } = useNextTheme();

  // Hydration çakışmasını önlemek için mount bekle
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const muiTheme = resolvedTheme === 'light' ? lightTheme : darkTheme;

  return (
    <MuiThemeProvider theme={muiTheme}>
      
      <CssBaseline />

      {/* ⬇️ Tüm uygulamayı sar */}
      <SnackbarProvider>
        {children}
      </SnackbarProvider>
    
    </MuiThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true, speedy: true }}>
      <NextThemesProvider
        attribute="class"          // <html class="light|dark"> atar, Tailwind ile uyumlu
        defaultTheme="system"      // sistem temasını kullan
        enableSystem
        disableTransitionOnChange  // tema değişince göz kırpmasın
      >
        <ThemeBridge>{children}</ThemeBridge>
      </NextThemesProvider>
    </AppRouterCacheProvider>
  );
}
