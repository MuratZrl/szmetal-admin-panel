// src/features/sidebar/types.ts
import type { OverridableComponent } from '@mui/types';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';

export type Role = 'Admin' | 'Manager' | 'User';
export type Status = 'Active' | 'Inactive' | 'Banned';

export type SidebarLink = {
  label: string;
  labelTr?: string;
  href?: string;

  // SADECE ŞU SATIRI değiştir
  icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;

  section?: 'main' | 'quick' | 'footer';
  order?: number;
  disabled?: boolean;
};
