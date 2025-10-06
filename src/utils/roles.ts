// src/features/account/helpers.ts
import type { SxProps, Theme } from '@mui/system';
import type { ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';

export type RoleKey = 'Admin' | 'Manager' | 'User' | 'Banned' | string;

export const ROLE_LABEL_MAP: Record<string, string> = {
  Admin: 'Admin',
  Manager: 'Yönetici',
  User: 'Kullanıcı',
  Banned: 'Engelli',
};

export function getRoleLabel(role?: RoleKey): string {
  if (!role) return ROLE_LABEL_MAP.User;
  return ROLE_LABEL_MAP[role] ?? role;
}

type ChipColor = Exclude<ChipProps['color'], undefined>; // 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'

/** Dashboard ile aynı renk eşlemesi */
export function getRoleChipColor(role?: RoleKey): ChipColor {
  const r = (role ?? '').toLowerCase();
  if (r === 'admin') return 'warning';
  if (r === 'manager') return 'info';
  if (r === 'user') return 'default';
  if (r === 'banned') return 'error';
  return 'default';
}

/** Dashboard’taki gibi outlined kullan */
export function getRoleChipVariant(): NonNullable<ChipProps['variant']> {
  return 'outlined';
}

/** Dark modda label rengine küçük dokunuş (dashboard ile aynı yaklaşım) */
export function getRoleChipSx(role?: RoleKey): SxProps<Theme> {
  return (theme) => {
    const color = getRoleChipColor(role);

    // default renk: nötr metin rengi
    if (color === 'default') {
      return {
        fontWeight: 700,
        ...(theme.palette.mode === 'dark'
          ? { '& .MuiChip-label': { color: alpha(theme.palette.text.primary, 0.85) } }
          : {}),
      };
    }

    // Tema paletlerinden "light" tonu seç
    const labelColor = (() => {
      switch (color) {
        case 'primary':   return theme.palette.primary.light;
        case 'secondary': return theme.palette.secondary.light;
        case 'success':   return theme.palette.success.light;
        case 'info':      return theme.palette.info.light;
        case 'warning':   return theme.palette.warning.light;
        case 'error':     return theme.palette.error.light;
        default:          return theme.palette.text.primary;
      }
    })();

    return {
      fontWeight: 700,
      ...(theme.palette.mode === 'dark'
        ? { '& .MuiChip-label': { color: labelColor } }
        : {}),
    };
  };
}

/** Tek çağrıda hepsi: label + color + variant + sx */
export function getRoleInfo(role?: RoleKey) {
  const color = getRoleChipColor(role);
  return {
    label: getRoleLabel(role),
    color,
    variant: getRoleChipVariant(),
    sx: getRoleChipSx(role),
  };
}
