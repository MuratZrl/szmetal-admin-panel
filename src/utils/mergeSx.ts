import type { SxProps, Theme } from '@mui/material/styles';

/** SxProps’ları güvenli şekilde birleştirir. Dizi/obje/fonksiyon hepsini destekler. */
export function mergeSx(...items: Array<SxProps<Theme> | undefined>): SxProps<Theme> {
  const flat = items.flatMap(i => (i ? (Array.isArray(i) ? i : [i]) : []));
  return (flat.length <= 1 ? flat[0] ?? {} : flat) as SxProps<Theme>;
}