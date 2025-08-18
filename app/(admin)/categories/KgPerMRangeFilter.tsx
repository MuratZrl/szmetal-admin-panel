'use client';

import { Typography, Slider, Card, CardHeader, CardContent } from '@mui/material';

import { useCategoryStore } from '../../../lib/stores/categoryStore';

export default function KgPerMRangeFilter() {
  const kgPerMRange = useCategoryStore((s) => s.kgPerMRange);
  const setKgPerMRange = useCategoryStore((s) => s.setKgPerMRange);

  return (
    <Card
      sx={{
        my: 1,
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >

      <CardHeader 
        title="Kg/m Aralığı"
        titleTypographyProps={{ variant: 'body2', fontWeight: 600 }} 

        sx={{
          background: 'linear-gradient(75deg, orangered 0%, orangered 1%, darkred 100%)',
          color: 'white',
          py: { xs: 0.5, sm: 1}, // mobilde daha az padding
        }}
      />

      <CardContent sx={{ py: 1.5 }} >
        <Slider
        value={kgPerMRange}
        onChange={(_, newValue) => setKgPerMRange(newValue as [number, number])}
        valueLabelDisplay="off"
        min={0}
        max={25000}
        sx={{
          height: 8,
          '& .MuiSlider-track': {
            background: 'linear-gradient(90deg, orangered 0%, orangered 30%, darkred 100%)',
            border: 'none',
          },
          '& .MuiSlider-rail': {
            opacity: 0.3,
            backgroundColor: '#ccc',
          },
          '& .MuiSlider-thumb': {
            backgroundColor: '#fff',
            border: '2px solid orangered',
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(255, 69, 0, 0.16)',
            },
          },
        }}
        />
        <Typography variant="caption" color="text.secondary">
          {kgPerMRange[0]} - {kgPerMRange[1]} kg/m
        </Typography>
      </CardContent>

    </Card>
  );
}
