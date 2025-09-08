// src/theme/types.d.ts

/// <reference types="@mui/x-data-grid/themeAugmentation" />
/// <reference types="@mui/lab/themeAugmentation" />

/**
 * MUI palette genişletmeleri:
 * - palette.surface: 1..4 seviye + outline/muted
 * - palette.accent: primary ile aynı şekil
 * - background.elevated: ek kâğıt/katman rengi
 */
declare module '@mui/material/styles' {
  /** Surface ölçeği — 1..4 seviye + outline/muted */
  export type SurfaceLevel = 1 | 2 | 3 | 4;
  export type SurfaceScale = Record<SurfaceLevel, string> & {
    outline: string;
    muted: string;
  };

  interface Palette {
    surface: SurfaceScale;
    accent: Palette['primary'];
  }

  interface PaletteOptions {
    surface?: Partial<Record<SurfaceLevel, string>> & {
      outline?: string;
      muted?: string;
    };
    accent?: PaletteOptions['primary'];
  }

  /** background.elevated desteği */
  interface TypeBackground {
    elevated?: string;
  }
}

export {};
