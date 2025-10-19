// src/features/sidebar/components/SidebarLogo.tsx
'use client';

import Link from 'next/link';
import { Box } from '@mui/material';
import type { Route } from 'next';

export default function SidebarLogo({
  href = '/create_request' as const,
}: {
  href?: Route;
}) {
  // Hiçbir tema hook’u, hiçbir mounted durumu yok.
  // SSR ve client aynı DOM’u üretir. Mismatch biter.
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Link href={href} aria-label="logo">
        <Box sx={{ position: 'relative', width: 60, height: 40, mx: 'auto' }}>
          <picture>
            {/* Dark temada beyaz logo */}
            <source srcSet="/logo_white.png" media="(prefers-color-scheme: dark)" />
            {/* Default: açık tema için siyah logo */}
            <img
              src="/logo_black.png"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
              draggable={false}
            />
          </picture>
        </Box>
      </Link>
    </Box>
  );
}
