'use client';
// src/features/sidebar/components/SidebarSub.client.tsx

import { usePathname } from 'next/navigation';

import { List } from '@mui/material';

import SidebarNavItem from './SidebarNavItem';

import type { SidebarLink } from '../types';

type Props = { links: SidebarLink[]; compact?: boolean };

export default function SidebarQuickActions({ links, compact = true }: Props) {
  const pathname = usePathname();

  const quick = links
    .filter(l => (l.section ?? 'main') === 'quick')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (quick.length === 0) return null;

  return (
    <List sx={{ display: 'flex', flexDirection: 'column', alignItems: compact ? 'center' : 'stretch', gap: 0.75, width: '100%' }}>
      {quick.map(link => {
        const href = link.href;
        const isActive =
          Boolean(
            href &&
              pathname &&
              (
                pathname === href ||
                pathname.startsWith(`${href}/`) ||
                pathname.startsWith(`${href}?`)
              ),
          );

        return (
          <SidebarNavItem
            key={href ?? link.label}
            link={link}
            active={isActive}
            compact={compact}
          />
        );
      })}
    </List>
  );
}
