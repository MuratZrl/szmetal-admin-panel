'use client';

import * as React from 'react';

export type Mode = 'light' | 'dark' | 'system';

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void; // <-- eklendi
};

const ThemeModeCtx = React.createContext<Ctx | undefined>(undefined);

// Sistem tercihine bak (client’ta)
function getSystemPalette(): 'light' | 'dark' {
  try {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeModeProvider({
  children,
  initialMode = 'system',
}: {
  children: React.ReactNode;
  initialMode?: Mode;
}) {
  // İlk render’da server’dan gelen mod ile başla
  const [mode, setModeState] = React.useState<Mode>(initialMode);

  // Kullanıcı modu değiştirirse kalıcı yap (cookie + localStorage)
  React.useEffect(() => {
    try {
      localStorage.setItem('theme-mode', mode);
    } catch {}
    try {
      document.cookie = `theme-mode=${mode}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const setMode = (m: Mode) => setModeState(m);

  // 'system' ise mevcut sistemin tersine geç, diğerlerinde klasik toggle
  const toggle = React.useCallback(() => {
    setModeState((prev) => {
      if (prev === 'system') {
        const sys = getSystemPalette();
        return sys === 'dark' ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = React.useMemo(() => ({ mode, setMode, toggle }), [mode, toggle]);

  return <ThemeModeCtx.Provider value={value}>{children}</ThemeModeCtx.Provider>;
}

export function useThemeMode() {
  const ctx = React.useContext(ThemeModeCtx);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
