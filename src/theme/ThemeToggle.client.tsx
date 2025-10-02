'use client';

import * as React from 'react';
import { ListItemButton, Tooltip, Box } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import type { TooltipProps } from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { useThemeMode } from './ThemeModeProvider.client';

type Props = {
  placement?: TooltipProps['placement']; // 'right' | 'bottom' | ...
};

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

export default function ThemeToggle({ placement = 'bottom' }: Props): React.JSX.Element {
  const { mode, toggle } = useThemeMode();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <Box sx={{ width: 44, height: 44 }} />;

  const nextText = mode === 'dark' ? 'Açık temaya geç' : 'Karanlık temaya geç';
  const Icon = mode === 'dark' ? LightModeIcon : DarkModeIcon;

  return (
    <Tooltip
      title={nextText}
      placement={placement}
      arrow
      disableInteractive
      enterTouchDelay={0}
      // scrollbar taşması olmasın diye güvenlik (opsiyonel ama iyi olur)
      PopperProps={{
        modifiers: [
          { name: 'offset', options: { offset: [0, 8] } },
          { name: 'preventOverflow', options: { altAxis: true, tether: false, rootBoundary: 'viewport' } },
        ],
      }}
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
      >
        <Box component="span" sx={{ display: 'inline-flex', pointerEvents: 'none' }}>
          <Icon fontSize="small" />
        </Box>
      </ListItemButton>
    </Tooltip>
  );
}
