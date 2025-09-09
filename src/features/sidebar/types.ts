// src/features/sidebar/types.ts
import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material';

export type Role = 'Admin' | 'User' | null;

// Uygulamada gerçekten kullandığın görünür etiketler
export type SidebarLinkLabel =
  | 'Account'
  | 'Dashboard'
  | 'Create Request'
  | 'Requests'
  | 'Clients'
  | 'Orders'
  | 'Products'
  | 'Logout';

export type SidebarLink = {
  label: SidebarLinkLabel;
  labelTr: string;
  href: `/${string}`;        // zorunlu ve slash ile başlasın
  icon: ComponentType<SvgIconProps>;
  disabled?: boolean;
  roles?: Array<Exclude<Role, null>>;
};
