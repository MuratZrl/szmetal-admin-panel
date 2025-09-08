// src/theme/ThemeToggle.client.tsx
'use client';

import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme(); // 'light' | 'dark'
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const current = resolvedTheme === 'dark' ? 'dark' : 'light';
  const next = current === 'light' ? 'dark' : 'light';

  return (
    <Tooltip title={`Tema: ${current} → ${next}`} placement='right' >
      <IconButton onClick={() => setTheme(next)} aria-label="Toggle theme" size="medium">
        {current === 'dark' ? <DarkModeIcon fontSize="medium" /> : <LightModeIcon fontSize="medium" />}
      </IconButton>
    </Tooltip>
  );
}
