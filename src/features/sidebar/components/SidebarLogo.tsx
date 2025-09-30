// src/features/sidebar/components/SidebarLogo.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Box, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

export default function SidebarLogo() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const src = theme.palette.mode === 'dark' ? '/logo_white.png' : '/logo_black.png';

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Link href="/create_request" aria-label="Go to request">
        <Box sx={{ position: 'relative', width: 60, height: 40, mx: 'auto' }}>
          {/* İlk render’da boş kutu, hydration sonrası görsel */}
          {mounted && (
            <Image
              src={src}
              alt="Logo"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center' }}
              priority
              draggable={false}
            />
          )}
        </Box>
      </Link>
    </Box>
  );
}
