// src/theme/ThemeToggle.client.tsx
'use client';
import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme as useNextTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Etkin mod (system ise resolvedTheme)
  const effective = (theme === 'system' ? resolvedTheme : theme) as 'light' | 'dark';

  // Bir sonraki mod (kullanıcının tıklayınca gideceği yer)
  const nextTheme: 'light' | 'dark' = effective === 'dark' ? 'light' : 'dark';

  const label = nextTheme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç';

  const handleClick = () => {
    setTheme(nextTheme);
  };

  return (
    <Tooltip title={label} placement="right">
      <IconButton onClick={handleClick} aria-label={label} size="medium">
        {nextTheme === 'dark' ? (
          <DarkModeIcon fontSize="medium" />
        ) : (
          <LightModeIcon fontSize="medium" />
        )}
      </IconButton>
    </Tooltip>
  );
}
