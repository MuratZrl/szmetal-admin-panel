// src/features/sidebar/components/SidebarLogo.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Box, GlobalStyles } from '@mui/material';
import type { Route } from 'next';

export default function SidebarLogo({
  href = '/account' as const,
}: {
  href?: Route;
}) {
  return (
    <>
      {/* Uygulama modu ThemeModeProvider içinde documentElement.dataset.mode olarak yazılıyor.
         Burada o attribute’a göre görünür/görünmez logoyu seçiyoruz. */}
      <GlobalStyles
        styles={{
          // Varsayılan: light görünür, dark gizli
          '.app-logo--light': { display: 'block' },
          '.app-logo--dark': { display: 'none' },

          // Uygulama modu DARK ise
          ':root[data-mode="dark"] .app-logo--light': { display: 'none' },
          ':root[data-mode="dark"] .app-logo--dark': { display: 'block' },

          // Uygulama modu LIGHT ise
          ':root[data-mode="light"] .app-logo--light': { display: 'block' },
          ':root[data-mode="light"] .app-logo--dark': { display: 'none' },

          // Uygulama modu SYSTEM/boş ise: OS tercihine bak
          '@media (prefers-color-scheme: dark)': {
            ':root:not([data-mode]) .app-logo--light, :root[data-mode="system"] .app-logo--light': {
              display: 'none',
            },
            ':root:not([data-mode]) .app-logo--dark, :root[data-mode="system"] .app-logo--dark': {
              display: 'block',
            },
          },
        }}
      />

      <Box display="flex" flexDirection="column" alignItems="center">
        <Link href={href} aria-label="logo">
          <Box sx={{ position: 'relative', width: 60, height: 40, mx: 'auto' }}>
            {/* Light tema için siyah logo */}
            <Image
              className="app-logo--light"
              src="/logo_black.png"
              alt="Logo"
              fill
              sizes="60px"
              priority
              draggable={false}
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
            {/* Dark tema için beyaz logo */}
            <Image
              className="app-logo--dark"
              src="/logo_white.png"
              alt="Logo"
              fill
              sizes="60px"
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
