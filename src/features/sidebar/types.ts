// src/features/sidebar/types.ts
import * as React from 'react';

export type Role = 'Admin' | 'Manager' | 'User';

export type NavSection = 'main' | 'quick' | 'footer';

export type SidebarLink = {
  label: string;
  labelTr?: string;
  href?: `/${string}`;
  icon: React.ElementType;
  disabled?: boolean;
  /** Hangi blokta görünsün? Belirtmezsen 'main' kabul edilir. */
  section?: NavSection;
  /** Aynı bölümdeki sıralama için opsiyonel. Küçük olan üstte. */
  order?: number;
};
