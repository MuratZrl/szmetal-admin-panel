// src/features/products/components/ui/Filter/sections/SortFilter.client.tsx
'use client';

import * as React from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';

import { sectionSx } from '../sectionSx';

type SortFilterSectionProps = {
  sort: string;
  onChangeSort: (value: string) => void;
};

export function SortFilterSection({ sort, onChangeSort }: SortFilterSectionProps) {
  return (
    <Box 
    
      component="section" 
    
      sx={(t) => ({
      ...sectionSx(t),
      borderRadius: 2.25, // istediğin değer: 0, 1.5, 2, 3, 10... neyse
      })}

    >
      <Typography variant="overline" sx={{ opacity: 0.75 }}>
        Sıralama
      </Typography>
      <TextField
        label="Sırala"
        select
        size="small"
        value={sort}
        onChange={(e) => onChangeSort(e.target.value)}
        fullWidth
        sx={{ mt: 1 }}
      >
        <MenuItem value="date-desc">Tarih Yeni → Eski</MenuItem>
        <MenuItem value="date-asc">Tarih Eski → Yeni</MenuItem>
        <MenuItem value="weight-asc">Birim Ağırlık Artan</MenuItem>
        <MenuItem value="weight-desc">Birim Ağırlık Azalan</MenuItem>
        <MenuItem value="code-asc">Kod A → Z</MenuItem>
        <MenuItem value="code-desc">Kod Z → A</MenuItem>
      </TextField>
    </Box>
  );
}
