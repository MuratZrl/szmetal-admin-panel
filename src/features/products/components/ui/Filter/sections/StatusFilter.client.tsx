'use client';
// src/features/products/components/ui/Filter/sections/StatusFilter.client.tsx

import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { darken, lighten } from '@mui/material/styles';

import { sectionSx } from '../sectionSx';

export type MoldMode = 'all' | 'mold' | 'nonMold';
export type AvailabilityMode = 'all' | 'unavailable' | 'available';
export type UpdatedMode = 'all' | 'updated' | 'notUpdated';

type StatusFilterSectionProps = {
  moldMode: MoldMode;
  onChangeMoldMode: (mode: MoldMode) => void;

  availabilityMode: AvailabilityMode;
  onChangeAvailabilityMode: (mode: AvailabilityMode) => void;
};

export function StatusFilterSection({
  moldMode,
  onChangeMoldMode,
  availabilityMode,
  onChangeAvailabilityMode,
}: StatusFilterSectionProps): React.JSX.Element {
  const isActive = moldMode !== 'all' || availabilityMode !== 'all';

  const handleClear = React.useCallback(() => {
    onChangeMoldMode('all');
    onChangeAvailabilityMode('all');
  }, [onChangeMoldMode, onChangeAvailabilityMode]);

  const insetX = 1.5;

  const handleMoldChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, next: MoldMode | null) => {
      if (next) onChangeMoldMode(next);
    },
    [onChangeMoldMode],
  );

  const handleAvailabilityChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, next: AvailabilityMode | null) => {
      if (next) onChangeAvailabilityMode(next);
    },
    [onChangeAvailabilityMode],
  );

  // ✅ “Evet” butonları için ortak gradient vurgusu (theme’e göre warning tonu)
  const yesSelectedSx = React.useCallback(
    (t: Theme) => {
      const base = t.palette.mode === 'dark' ? t.palette.warning.light : t.palette.warning.dark;
      const c1 = lighten(base, t.palette.mode === 'dark' ? 0 : 0.18);
      const c2 = darken(base, t.palette.mode === 'dark' ? 0.58 : 0.10);

      return {
        '&.Mui-selected': {
          backgroundColor: base,
          backgroundImage: `linear-gradient(135deg, ${c1} 0%, ${base} 45%, ${c2} 100%)`,
          borderColor: base,
          color: t.palette.getContrastText(base),
        },
        '&.Mui-selected:hover': {
          backgroundColor: base,
          backgroundImage: `linear-gradient(135deg, ${lighten(base, t.palette.mode === 'dark' ? 0.14 : 0.22)} 0%, ${base} 45%, ${darken(base, t.palette.mode === 'dark' ? 0.22 : 0.14)} 100%)`,
        },
      } as const;
    },
    [],
  );

  // "Hayır" butonları için ortak gradient vurgusu (theme'e göre error/red tonu)
  const noSelectedSx = React.useCallback(
    (t: Theme) => {
      const base = t.palette.mode === 'dark' ? t.palette.error.main : t.palette.error.dark;
      const c1 = lighten(base, t.palette.mode === 'dark' ? 0.05 : 0.10);
      const c2 = darken(base, t.palette.mode === 'dark' ? 0.45 : 0.20);

      return {
        '&.Mui-selected': {
          backgroundColor: base,
          backgroundImage: `linear-gradient(135deg, ${c1} 0%, ${base} 45%, ${c2} 100%)`,
          borderColor: base,
          color: t.palette.getContrastText(base),
        },
        '&.Mui-selected:hover': {
          backgroundColor: base,
          backgroundImage: `linear-gradient(135deg, ${lighten(base, t.palette.mode === 'dark' ? 0.10 : 0.15)} 0%, ${base} 45%, ${darken(base, t.palette.mode === 'dark' ? 0.30 : 0.25)} 100%)`,
        },
      } as const;
    },
    [],
  );

  return (
    <Box
      component="section"
      sx={(t) => ({
        ...sectionSx(t),
        borderRadius: 2.25,
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pl: insetX,
          pr: insetX,
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.75 }}>
          Durumlar
        </Typography>

        <Button
          variant="text"
          size="small"
          disableRipple
          disabled={!isActive}
          onClick={handleClear}
          sx={{
            minWidth: 'auto',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            textTransform: 'none',
            lineHeight: 1.2,
            '&:hover': { backgroundColor: 'transparent' },
            '&:active': { backgroundColor: 'transparent' },
            '&.Mui-focusVisible': { backgroundColor: 'transparent' },
          }}
        >
          Temizle
        </Button>
      </Box>

      <Box
        sx={(t) => ({
          mt: 1,
          mb: 1.5,
          height: 2,
          borderRadius: 999,
          bgcolor: t.palette.divider,
        })}
      />

      <List dense disablePadding>
        <ListItemButton
          disableRipple
          disableTouchRipple
          sx={{
            pl: insetX,
            pr: insetX,
            py: 0.25,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 1,
            cursor: 'default',
          }}
        >
          <ListItemText primary="Müşteri Kalıbı" sx={{ m: 0 }} />

          <ToggleButtonGroup
            exclusive
            size="small"
            value={moldMode}
            onChange={handleMoldChange}
            sx={{
              ml: 1,
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                px: 1,
                py: 0.25,
                lineHeight: 1.2,
              },
            }}
          >
            <ToggleButton value="all">Tümü</ToggleButton>

            {/* ✅ EVET -> gradient warning */}
            <ToggleButton value="mold" sx={yesSelectedSx}>
              Evet
            </ToggleButton>

            <ToggleButton value="nonMold" sx={noSelectedSx}>Hayır</ToggleButton>
          </ToggleButtonGroup>
        </ListItemButton>

        <Divider sx={{ my: 0.75 }} />

        <ListItemButton
          disableRipple
          disableTouchRipple
          sx={{
            pl: insetX,
            pr: insetX,
            py: 0.25,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 1,
            cursor: 'default',
          }}
        >
          <ListItemText primary="Kullanılabilirlik" sx={{ m: 0 }} />

          <ToggleButtonGroup
            exclusive
            size="small"
            value={availabilityMode}
            onChange={handleAvailabilityChange}
            sx={{
              ml: 1,
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                px: 1,
                py: 0.25,
                lineHeight: 1.2,
              },
            }}
          >
            <ToggleButton value="all">Tümü</ToggleButton>

            {/* ✅ EVET -> aynı gradient warning */}
            <ToggleButton value="unavailable" sx={yesSelectedSx}>
              Evet
            </ToggleButton>

            <ToggleButton value="available" sx={noSelectedSx}>Hayır</ToggleButton>
          </ToggleButtonGroup>
        </ListItemButton>
      </List>
    </Box>
  );
}
