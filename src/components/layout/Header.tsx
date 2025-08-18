'use client';

import { usePathname } from 'next/navigation';
import { Typography, Box } from '@mui/material';
import { useEffect, useState } from 'react';

import { mainLinks } from '@/constants/mainlinks';

export default function Header() {
  const pathname = usePathname();
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const current = mainLinks.find(
      (link) => pathname === link.href || pathname.startsWith(`${link.href}/`)
    );
    setTitle(current?.labelTr ?? 'Sayfa');
  }, [pathname]);

  if (!title) return null;

  return (
    <Box >
      <Typography variant="h4" fontWeight={600}>
        {title}
      </Typography>
    </Box>
  );
}
