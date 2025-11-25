// src/features/products/components/ui/Filter/sections/StatusFilterSection.tsx
'use client';

import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';

import { sectionSx } from '../sectionSx';

type StatusFilterSectionProps = {
  moldOnly: boolean;
  onToggleMold: () => void;
  availableOnly: boolean;
  onToggleAvailable: () => void;
};

export function StatusFilterSection({
  moldOnly,
  onToggleMold,
  availableOnly,
  onToggleAvailable,
}: StatusFilterSectionProps) {
  return (
    <Box component="section" sx={(t) => sectionSx(t)}>
      <Typography variant="overline" sx={{ opacity: 0.75 }}>
        Durumlar
      </Typography>
      <Box>
        <FormControlLabel
          control={<Checkbox checked={moldOnly} onChange={onToggleMold} />}
          label="Müşteri Kalıbı"
        />
      </Box>
      <Box>
        <FormControlLabel
          control={<Checkbox checked={availableOnly} onChange={onToggleAvailable} />}
          label="Kullanılamaz"
        />
      </Box>
    </Box>
  );
}
