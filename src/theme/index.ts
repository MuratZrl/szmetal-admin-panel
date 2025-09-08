// src/theme/index.ts
import { createTheme, responsiveFontSizes, type PaletteMode, type Theme } from '@mui/material/styles';
import { lightPalette } from './variants/light';
import { darkPalette } from './variants/dark';
import { componentsOverrides } from './components';

/**
 * Uygulama teması — light/dark varyantlarını tek bir factory ile üretir.
 * Not: surface / accent gibi palette genişletmeleri için src/theme/types.d.ts ekli olmalı.
 */
export function createAppTheme(mode: PaletteMode): Theme {
  // 1) Ortak taban tema (typography, shape vb. burada)
  const base = createTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: [
        // Sistem font stack — istersen burayı özgün fontla değiştir
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
      h1: { fontWeight: 700, letterSpacing: -0.5 },
      h2: { fontWeight: 700, letterSpacing: -0.4 },
      h3: { fontWeight: 700, letterSpacing: -0.2 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
  });

  // 2) Tema oluşturulduktan sonra, tema referansı gerektiren component overrides ekle
  const themed = createTheme(base, {
    components: {
      ...componentsOverrides(base),
    },
  });

  // 3) Responsive font ölçüleri
  return responsiveFontSizes(themed);
}

// (İsteğe bağlı) Dışarı aktarımlar
export type AppTheme = ReturnType<typeof createAppTheme>;
export { lightPalette, darkPalette };
