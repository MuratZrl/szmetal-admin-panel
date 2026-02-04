'use client';
// src/theme/ThemeToggle.client.tsx

import * as React from 'react';
import { ListItemButton, Tooltip, Box } from '@mui/material';
import { alpha, type SxProps, type Theme, useTheme } from '@mui/material/styles';
import type { TooltipProps } from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { useThemeMode } from '@/theme/ThemeModeProvider.client';

type Props = { placement?: TooltipProps['placement'] };

const buttonSx: SxProps<Theme> = (theme) => {
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

export default function ThemeToggle({ placement = 'left' }: Props): React.JSX.Element {
  const { toggle } = useThemeMode();       // sadece eylem için
  const theme = useTheme();                // görsel gerçeklik için
  const paletteMode = theme.palette.mode;  // 'light' | 'dark'

  // SSR titremesini kes
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <Box sx={{ width: 44, height: 44 }} />;

  const isDark = paletteMode === 'dark';
  const nextText = isDark ? 'Açık temaya geç' : 'Karanlık temaya geç';
  const Icon = isDark ? LightModeIcon : DarkModeIcon;

  return (
    <Tooltip
      key={paletteMode}               // ← mod değişince Tooltip remount olsun
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
        sx={buttonSx}
        data-mode={paletteMode}       // küçük teşhis etiketi (görselde işe yarar)
      >
        <Box component="span" sx={{ display: 'inline-flex', pointerEvents: 'none' }}>
          <Icon fontSize="small" />
        </Box>
      </ListItemButton>
    </Tooltip>
  );
}
