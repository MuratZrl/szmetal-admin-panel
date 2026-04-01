'use client';
// src/theme/ThemeToggle.client.tsx

import * as React from 'react';
import { ListItemButton, Tooltip, Box, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme, useTheme } from '@mui/material/styles';
import type { TooltipProps } from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { useThemeMode } from '@/theme/ThemeModeProvider.client';

type Props = {
  placement?: TooltipProps['placement'];
  compact?: boolean;
};

const compactButtonSx: SxProps<Theme> = (theme) => {
  const base = theme.palette.accent?.main ?? theme.palette.primary.main;
  return {
    justifyContent: 'center',
    width: 44,
    height: 44,
    minWidth: 44,
    px: 0,
    borderRadius: '50%',
    '&:hover': { backgroundColor: alpha(base, 0.10) },
    '&.Mui-selected': { backgroundColor: alpha(base, 0.18) },
    '&.Mui-selected:hover': { backgroundColor: alpha(base, 0.22) },
    '&.Mui-focusVisible': { backgroundColor: alpha(base, 0.14) },
  };
};

export default function ThemeToggle({ placement = 'left', compact = true }: Props): React.JSX.Element {
  const { toggle } = useThemeMode();
  const theme = useTheme();
  const paletteMode = theme.palette.mode;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <Box sx={{ width: 44, height: 44 }} />;

  const isDark = paletteMode === 'dark';
  const nextText = isDark ? 'Açık temaya geç' : 'Karanlık temaya geç';
  const labelText = isDark ? 'Açık Tema' : 'Koyu Tema';
  const Icon = isDark ? LightModeIcon : DarkModeIcon;

  if (compact) {
    return (
      <Tooltip
        key={paletteMode}
        title={nextText}
        placement={placement}
        arrow
        disableInteractive
        enterTouchDelay={0}
        slotProps={{
          popper: {
            modifiers: [
              { name: 'offset', options: { offset: [0, 8] } },
              { name: 'preventOverflow', options: { altAxis: true, tether: false, rootBoundary: 'viewport' } },
            ],
          },
        }}
      >
        <ListItemButton
          component="button"
          type="button"
          aria-label={nextText}
          onClick={toggle}
          sx={compactButtonSx}
          data-mode={paletteMode}
        >
          <Box component="span" sx={{ display: 'inline-flex', pointerEvents: 'none' }}>
            <Icon fontSize="small" />
          </Box>
        </ListItemButton>
      </Tooltip>
    );
  }

  return (
    <ListItemButton
      component="button"
      type="button"
      aria-label={nextText}
      onClick={toggle}
      data-mode={paletteMode}
      sx={{
        borderRadius: 2,
        px: 1.5,
        py: 0.75,
        gap: 1.5,
      }}
    >
      <Box component="span" sx={{ display: 'inline-flex' }}>
        <Icon fontSize="small" />
      </Box>
      <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
        {labelText}
      </Typography>
    </ListItemButton>
  );
}
