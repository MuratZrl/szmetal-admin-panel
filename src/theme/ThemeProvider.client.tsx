'use client';
import * as React from 'react';
import { ThemeProvider, CssBaseline, useMediaQuery, type PaletteMode } from '@mui/material';
import { createAppTheme } from '@/theme';

export type Mode = 'light' | 'dark' | 'system';

const ThemeModeCtx = React.createContext<{ mode: Mode; setMode: (m: Mode) => void }>({
  mode: 'system',
  setMode: () => {},
});

export function useThemeMode() {
  return React.useContext(ThemeModeCtx);
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const [mode, setMode] = React.useState<Mode>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem('theme-mode') as Mode | null;
    return stored ?? 'system';
  });

  const paletteMode: PaletteMode = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  const theme = React.useMemo(() => createAppTheme(paletteMode), [paletteMode]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('theme-mode', mode);
  }, [mode]);

  return (
    <ThemeModeCtx.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeCtx.Provider>
  );
}
