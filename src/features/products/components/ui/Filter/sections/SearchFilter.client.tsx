'use client';
// src/features/products/components/ui/Filter/sections/SearchFilter.client.tsx

import * as React from 'react';
import { Box, TextField, Typography } from '@mui/material';

import { sectionSx } from '../sectionSx';
import { SEARCH_ID } from '@/features/products/components/ui/Filter/constants';

type SearchFilterSectionProps = {
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
};

export function SearchFilterSection({
  value,
  onChange,
  inputId = SEARCH_ID, // 'products-filter-search'
}: SearchFilterSectionProps): React.JSX.Element {
  return (
    <Box component="section" sx={(t) => ({ ...sectionSx(t), borderRadius: 2.25 })}>
      <Typography variant="overline" sx={{ opacity: 0.75 }}>
        Genel Arama
      </Typography>

      <Box sx={(t) => ({ mt: 1, mb: 1.5, height: 2, borderRadius: 999, bgcolor: t.palette.divider })} />

      <TextField
        id={inputId}
        name="q"
        fullWidth
        label="Ara (ad veya kod)"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
        inputProps={{ enterKeyHint: 'search' }}
      />
    </Box>
  );
}
