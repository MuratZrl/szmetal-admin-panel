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
    .filter((l) => (l.section ?? 'main') === 'quick')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (quick.length === 0) return null;

  return (
    <List
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: compact ? 'center' : 'stretch',
        gap: 0.75,
        width: '100%',
      }}
    >
      {quick.map((link, idx) => {
        const href = link.href ?? null;

        const isActive =
          Boolean(
            href &&
              pathname &&
              (pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`)),
          );

        // ✅ benzersiz key: quick|href|label|idx
        const key = `quick|${href ?? 'nohref'}|${link.label}|${idx}`;

        return (
          <SidebarNavItem
            key={key}
            link={link}
            active={isActive}
            compact={compact}
          />
        );
      })}
    </List>
  );
}
