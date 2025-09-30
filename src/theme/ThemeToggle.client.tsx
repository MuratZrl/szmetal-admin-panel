'use client';

import * as React from 'react';
import { ListItemButton, Tooltip, Box } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { useThemeMode } from './ThemeModeProvider.client';

const buttonSx: SxProps<Theme> = (theme) => {
  const base = theme.palette.accent?.main ?? theme.palette.primary.main;

  return {
    justifyContent: 'center',
    width: 44,
    height: 44,
    minWidth: 44,
    px: 0,
    borderRadius: '50%',

    // Durum arka planları
    '&:hover': {
      backgroundColor: alpha(base, 0.10),
    },
    '&.Mui-selected': {
      backgroundColor: alpha(base, 0.18),
    },
    '&.Mui-selected:hover': {
      backgroundColor: alpha(base, 0.22),
    },
    '&.Mui-focusVisible': {
      backgroundColor: alpha(base, 0.14),
    },
  };
};

export default function ThemeToggleSidebar(): React.JSX.Element {
  const { mode, toggle } = useThemeMode();

  // İlk render jitter’ını kes, layout kırılmasın diye boş kutu dön
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <Box sx={{ width: 44, height: 44 }} />;

  const nextText = mode === 'dark' ? 'Açık temaya geç' : 'Karanlık temaya geç';
  const Icon = mode === 'dark' ? LightModeIcon : DarkModeIcon;

  return (
    <Tooltip title={nextText} placement="right" arrow disableInteractive enterTouchDelay={0}>
      <ListItemButton
        component="button"
        type="button"
        aria-label={nextText}
        onClick={toggle}
        sx={buttonSx}
      >
        <Box component="span" sx={{ display: 'inline-flex', pointerEvents: 'none' }}>
          <Icon fontSize="small" />
        </Box>
      </ListItemButton>
    </Tooltip>
  );
}
