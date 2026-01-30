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

import { sectionSx } from '../sectionSx';

export type MoldMode = 'all' | 'mold' | 'nonMold';
export type AvailabilityMode = 'all' | 'unavailable' | 'available';

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
      // aynı seçeneğe tekrar tıklayınca null gelebilir, istemiyoruz
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
        {/* Müşteri Kalıbı: 3 durumlu */}
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
            aria-label="Müşteri kalıbı filtresi"
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
            <ToggleButton value="all" aria-label="Hepsi">
              Tümü
            </ToggleButton>
            <ToggleButton value="mold" aria-label="Sadece kalıplı">
              Evet
            </ToggleButton>
            <ToggleButton value="nonMold" aria-label="Sadece kalıpsız">
              Hayır
            </ToggleButton>
          </ToggleButtonGroup>
        </ListItemButton>

        <Divider sx={{ my: 0.75 }} />

        {/* Kullanılabilirlik: 3 durumlu */}
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
            aria-label="Kullanılabilirlik filtresi"
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
            <ToggleButton value="all" aria-label="Hepsi">
              Tümü
            </ToggleButton>
            <ToggleButton value="unavailable" aria-label="Kullanılamaz">
              Evet
            </ToggleButton>
            <ToggleButton value="available" aria-label="Kullanılabilir">
              Hayır
            </ToggleButton>
          </ToggleButtonGroup>
        </ListItemButton>
      </List>
    </Box>
  );
}
