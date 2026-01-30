'use client';
// src/features/products/components/ui/Filter/sections/SortFilter.client.tsx

import * as React from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';

import { sectionSx } from '../sectionSx';
import { SORT_SELECT_ID, DEFAULT_SORT } from '@/features/products/components/ui/Filter/constants';

type SortFilterSectionProps = {
  sort: string;
  onChangeSort: (value: string) => void;
};

export function SortFilterSection({ sort, onChangeSort }: SortFilterSectionProps): React.JSX.Element {
  const insetX = 1.5;

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
      {/* Başlık satırı: insetX ile hizalı */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pl: insetX,
          pr: insetX,
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

      {/* Divider: TAM GENİŞLİK (daralmasın) */}
      <Box
        sx={(t) => ({
          mt: 1,
          mb: 1.5,
          height: 2,
          borderRadius: 999,
          bgcolor: t.palette.divider,
        })}
      />

      {/* İçerik: insetX ile hizalı */}
      <Box sx={{ px: insetX }}>
        <TextField
          id={SORT_SELECT_ID}
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
    </Box>
  );
}
