// src/features/products/components/ui/Filter/sections/ActionsSection.tsx
'use client';

import * as React from 'react';
import { Box, Button, Grid } from '@mui/material';

import { sectionSx } from '../sectionSx';

type ActionsSectionProps = {
  onReset: () => void;
};

export function ActionsSection({ onReset }: ActionsSectionProps) {
  return (
    <Box component="section" sx={(t) => ({ ...sectionSx(t), p: 1 })}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <Button
            fullWidth
            onClick={onReset}
            variant="outlined"
            color="contrast"
            sx={{ textTransform: 'capitalize' }}
          >
            Sıfırla
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
