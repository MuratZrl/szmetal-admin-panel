'use client';
// src/features/products/components/ui/Filter/sections/SortFilter.client.tsx

import * as React from 'react';
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

import { sectionSx } from '../sectionSx';
import { SORT_SELECT_ID, DEFAULT_SORT } from '@/features/products/components/ui/Filter/constants';
import type { ProductSort } from '@/features/products/components/ui/Filter/hooks/useProductFilters';

type SortFilterSectionProps = {
  sort: ProductSort;
  onChangeSort: (value: ProductSort) => void;
};

const OPTIONS: ReadonlyArray<{ value: ProductSort; label: string; short?: string }> = [
  { value: 'date-desc', label: 'Tarih Yeni → Eski', short: 'Yeni' },
  { value: 'date-asc', label: 'Tarih Eski → Yeni', short: 'Eski' },
  { value: 'code-asc', label: 'Kod A → Z', short: 'Kod A-Z' },
  { value: 'code-desc', label: 'Kod Z → A', short: 'Kod Z-A' },
  { value: 'weight-asc', label: 'Birim Ağırlık Artan', short: 'Ağ. ↑' },
  { value: 'weight-desc', label: 'Birim Ağırlık Azalan', short: 'Ağ. ↓' },
];

function isProductSort(v: string): v is ProductSort {
  return OPTIONS.some((o) => o.value === v);
}

export function SortFilterSection({ sort, onChangeSort }: SortFilterSectionProps): React.JSX.Element {
  const insetX = 1.5;
  const theme = useTheme<Theme>();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  // constants'tan gelen DEFAULT_SORT string olabilir; union'a oturtuyoruz.
  const defaultSort = DEFAULT_SORT as ProductSort;

  const isActive = sort !== defaultSort;

  const handleClear = React.useCallback(() => {
    onChangeSort(defaultSort);
  }, [onChangeSort, defaultSort]);

  const handleSelectChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (isProductSort(v)) onChangeSort(v);
      else onChangeSort(defaultSort);
    },
    [onChangeSort, defaultSort],
  );

  const handleToggleChange = React.useCallback(
    (_e: React.MouseEvent<HTMLElement>, value: ProductSort | null) => {
      if (value) onChangeSort(value);
    },
    [onChangeSort],
  );

  return (
    <Box
      component="section"
      sx={(t) => ({
        ...sectionSx(t),
        borderRadius: 2.25,
      })}
    >
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

      <Box
        sx={(t) => ({
          mt: 1,
          mb: 1.5,
          height: 2,
          borderRadius: 999,
          bgcolor: t.palette.divider,
        })}
      />

      <Box sx={{ px: insetX }}>
        {smUp ? (
          <ToggleButtonGroup
            value={sort}
            exclusive
            onChange={handleToggleChange}
            size="small"
            fullWidth
            aria-label="Sıralama seçimi"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                whiteSpace: 'nowrap',
                px: 1,
              },
            }}
          >
            {OPTIONS.map((o) => (
              <ToggleButton key={o.value} value={o.value} aria-label={o.label}>
                {o.short ?? o.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : (
          <TextField
            id={SORT_SELECT_ID}
            label="Sırala"
            select
            size="small"
            value={sort}
            onChange={handleSelectChange}
            fullWidth
          >
            {OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>
    </Box>
  );
}
