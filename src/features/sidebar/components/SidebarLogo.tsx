'use client';
// src/features/sidebar/components/SidebarLogo.tsx

import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';

import { Box, GlobalStyles } from '@mui/material';

type Variant = 'compact' | 'expanded';
type Size = { width: number; height: number };

export default function SidebarLogo({
  href = '/account' as const,
  variant = 'compact',
  size,
}: {
  href?: Route;
  variant?: Variant;
  size?: Size;
}) {
  const base: Size = variant === 'expanded'
    ? { width: 150, height: 60 }
    : { width: 48, height: 30 };
  const dims = size ?? base;

  return (
    <>
      <GlobalStyles
        styles={{
          '.app-logo--light': { display: 'block' },
          '.app-logo--dark':  { display: 'none'  },
          ':root[data-mode="dark"] .app-logo--light': { display: 'none' },
          ':root[data-mode="dark"] .app-logo--dark':  { display: 'block' },
          ':root[data-mode="light"] .app-logo--light': { display: 'block' },
          ':root[data-mode="light"] .app-logo--dark':  { display: 'none'  },
          '@media (prefers-color-scheme: dark)': {
            ':root:not([data-mode]) .app-logo--light, :root[data-mode="system"] .app-logo--light': { display: 'none' },
            ':root:not([data-mode]) .app-logo--dark,  :root[data-mode="system"] .app-logo--dark':  { display: 'block' },
          },
        }}
      />

      <Box display="flex" flexDirection="column" alignItems="center">
        <Link href={href} aria-label="logo">
          <Box sx={{ position: 'relative', width: dims.width, height: dims.height, mx: 'auto' }}>
            <Image
              className="app-logo--light"
              src="/logo_black.png"
              alt="Logo"
              fill
              sizes={`${dims.width}px`}
              priority
              draggable={false}
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
            <Image
              className="app-logo--dark"
              src="/logo_white.png"
              alt="Logo"
              fill
              sizes={`${dims.width}px`}
              priority
              draggable={false}
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
          </Box>
        </Link>
      </Box>
    </>
  );
}
