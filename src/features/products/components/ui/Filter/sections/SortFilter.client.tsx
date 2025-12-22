// src/features/products/components/ui/Filter/sections/SortFilter.client.tsx
'use client';

import * as React from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';

import { sectionSx } from '../sectionSx';

type SortFilterSectionProps = {
  sort: string;
  onChangeSort: (value: string) => void;
};

// Projede varsayılan sort neyse bunu ona göre ayarla.
// Eğer default boş string ise: const DEFAULT_SORT = '';
const DEFAULT_SORT = 'date-desc';

export function SortFilterSection({ sort, onChangeSort }: SortFilterSectionProps): React.JSX.Element {
  const isActive = sort !== DEFAULT_SORT;

  const handleClear = React.useCallback(() => {
    onChangeSort(DEFAULT_SORT);
  }, [onChangeSort]);

  return (
    <Box
      component="section"
      sx={(t) => ({
        ...sectionSx(t),
        borderRadius: 2.25,
      })}
    >
      {/* Başlık satırı: solda başlık, sağda Temizle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.75 }}>
          Sıralama
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

      {/* Başlık ile içerik arasında düz renk separator */}
      <Box
        sx={(t) => ({
          mt: 1,
          mb: 1.5,
          height: 2,
          borderRadius: 999,
          bgcolor: t.palette.divider,
        })}
      />

      <TextField
        label="Sırala"
        select
        size="small"
        value={sort}
        onChange={(e) => onChangeSort(e.target.value)}
        fullWidth
      >
        <MenuItem value="date-desc">Tarih Yeni → Eski</MenuItem>
        <MenuItem value="date-asc">Tarih Eski → Yeni</MenuItem>
        <MenuItem value="code-asc">Kod A → Z</MenuItem>
        <MenuItem value="code-desc">Kod Z → A</MenuItem>
        <MenuItem value="weight-asc">Birim Ağırlık Artan</MenuItem>
        <MenuItem value="weight-desc">Birim Ağırlık Azalan</MenuItem>
      </TextField>
    </Box>
  );
}
