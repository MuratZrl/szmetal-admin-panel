// src/theme/types.d.ts

/// <reference types="@mui/x-data-grid/themeAugmentation" />
/// <reference types="@mui/lab/themeAugmentation" />

/**
 * MUI palette genişletmeleri:
 * - palette.surface: 1..4 seviye + outline/muted
 * - palette.accent: primary ile aynı şekil
 * - palette.requestStatus: rozet stilleri (pending | approved | rejected)
 * - palette.status: uygulama statü renkleri (Active | Inactive | Banned)
 * - palette.charts.categorical: grafikler için kategorik dizi
 * - background.elevated: ek kâğıt/katman rengi
 */

export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type StatusStyle = { bg: string; fg: string; bd?: string };

// Uygulama kullanıcı statüsü
export type AppUserStatus = 'Active' | 'Inactive' | 'Banned';

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
    requestStatus: Record<RequestStatus, StatusStyle>;

    /** Uygulama statü renkleri (grafik, rozet vb.) */
    status: Record<AppUserStatus, string>;

    /** Grafikler için kategorik renk paleti */
    charts: { categorical: readonly string[] };
  }

  interface PaletteOptions {
    surface?: Partial<Record<SurfaceLevel, string>> & {
      outline?: string;
      muted?: string;
    };
    accent?: PaletteOptions['primary'];
    requestStatus?: Partial<Record<RequestStatus, StatusStyle>>;

    status?: Partial<Record<AppUserStatus, string>>;
    charts?: Partial<{ categorical: readonly string[] }>;
  }

  /** background.elevated desteği */
  interface TypeBackground {
    elevated?: string;
  }
}

export {};
