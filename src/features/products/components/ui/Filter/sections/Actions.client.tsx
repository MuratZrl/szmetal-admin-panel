'use client';
// src/features/products/components/ui/Filter/sections/Actions.client.tsx

import { Box, Button, Grid } from '@mui/material';

import { sectionSx } from '../sectionSx';

type ActionsSectionProps = {
  onReset: () => void;
};

export function ActionsSection({ onReset }: ActionsSectionProps) {
  return (
    <Box component="section" sx={(t) => ({ ...sectionSx(t), p: 1, borderRadius: 2.25 })}>
      <Grid size={{ xs: 12 }}>
        <Button
          fullWidth
          disableRipple
          disableElevation
          onClick={onReset}
          variant="text"
          color="contrast"
          sx={{
            borderRadius: 2.25,
            textTransform: 'capitalize',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&:active': {
              backgroundColor: 'transparent',
            },
            '&.Mui-focusVisible': {
              backgroundColor: 'transparent',
            },
          }}
        >
          Filtre Sıfırla
        </Button>
      </Grid>
    </Box>
  );
}
