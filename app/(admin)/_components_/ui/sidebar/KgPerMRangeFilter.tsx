'use client';

import { Typography, Slider, Card } from '@mui/material';

import { useCategoryStore } from '../../../../lib/stores/categoryStore';

export default function KgPerMRangeFilter() {
  const kgPerMRange = useCategoryStore((s) => s.kgPerMRange);
  const setKgPerMRange = useCategoryStore((s) => s.setKgPerMRange);

  return (
    <Card
      sx={{
        px: 2,
        py: 2,
        my: 1,

        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" fontWeight={600} gutterBottom>
        Kg/m Aralığı
      </Typography>
      <Slider
        value={kgPerMRange}
        onChange={(_, newValue) => setKgPerMRange(newValue as [number, number])}
        valueLabelDisplay="auto"
        min={0}
        max={25000}
        sx={{
          color: 'orangered',
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {kgPerMRange[0]} - {kgPerMRange[1]} kg/m
      </Typography>
    </Card>
  );
}
