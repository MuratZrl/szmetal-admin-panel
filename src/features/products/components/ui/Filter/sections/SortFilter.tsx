// src/features/products/components/ui/Filter/sections/SortFilterSection.tsx
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
    <Box component="section" sx={(t) => sectionSx(t)}>
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
        <MenuItem value="date-desc">Tarih yeni → eski</MenuItem>
        <MenuItem value="date-asc">Tarih eski → yeni</MenuItem>
        <MenuItem value="weight-asc">Ağırlık artan</MenuItem>
        <MenuItem value="weight-desc">Ağırlık azalan</MenuItem>
        <MenuItem value="code-asc">Kod A → Z</MenuItem>
        <MenuItem value="code-desc">Kod Z → A</MenuItem>
      </TextField>
    </Box>
  );
}
