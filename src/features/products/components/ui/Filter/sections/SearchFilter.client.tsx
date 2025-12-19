// src/features/products/components/ui/Filter/sections/SearchFilter.client.tsx
'use client';

import * as React from 'react';
import { Box, TextField, Typography } from '@mui/material';

import { sectionSx } from '../sectionSx';

type SearchFilterSectionProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchFilterSection({ value, onChange }: SearchFilterSectionProps) {
  return (
    <Box 
    
      component="section"     
    
      sx={(t) => ({
        ...sectionSx(t),
        borderRadius: 2.25, // istediğin değer: 0, 1.5, 2, 3, 10... neyse
      })}

    >

      <Typography variant="overline" gutterBottom sx={{ opacity: 0.75 }}>
        Genel Arama
      </Typography>
      
      <TextField
        fullWidth
        label="Ara (ad veya kod)"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        inputProps={{ enterKeyHint: 'search' }}
        sx={{ mt: 1.5 }}
      />

    </Box>
  );
}
