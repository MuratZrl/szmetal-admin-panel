// src/features/products/components/ui/Filter/sections/VariantFilterSection.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import type { VariantOption } from '../types';
import { sectionSx } from '../sectionSx';
import { VARIANT_ROW_H_PX, VISIBLE_VARIANT_ROWS } from '../constants';

type VariantFilterSectionProps = {
  variants: VariantOption[];
  variantQuery: string;
  onChangeVariantQuery: (value: string) => void;
  variantsSel: string[];
  setVariantsSel: React.Dispatch<React.SetStateAction<string[]>>;
};

export function VariantFilterSection({
  variants,
  variantQuery,
  onChangeVariantQuery,
  variantsSel,
  setVariantsSel,
}: VariantFilterSectionProps) {
  const collator = React.useMemo(
    () => new Intl.Collator('tr', { sensitivity: 'base', numeric: false }),
    [],
  );

  const variantsSorted = React.useMemo(() => {
    return [...variants].sort((a, b) => {
      const an = (a.name ?? '').trim();
      const bn = (b.name ?? '').trim();
      const cmp = collator.compare(an, bn);
      return cmp !== 0 ? cmp : collator.compare(a.key, b.key);
    });
  }, [variants, collator]);

  const variantsFiltered = React.useMemo(() => {
    const needle = variantQuery.trim().toLocaleLowerCase('tr');
    if (!needle) return variantsSorted;
    return variantsSorted.filter((v) => {
      const name = (v.name ?? '').toLocaleLowerCase('tr');
      const key = v.key.toLocaleLowerCase('tr');
      return name.includes(needle) || key.includes(needle);
    });
  }, [variantQuery, variantsSorted]);

  return (
    <Box component="section" sx={(t) => sectionSx(t)}>
      <Typography variant="overline" sx={{ opacity: 0.75 }}>
        Profil Çeşidi
      </Typography>

      <Grid container spacing={1} alignItems="center" sx={{ mt: 1.5, mb: 1 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ara"
            value={variantQuery}
            onChange={(e) => onChangeVariantQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                height: 32,
                '& .MuiInputBase-input': { py: 0.25, fontSize: 12.5 },
                '& .MuiInputAdornment-root': { mr: 0.25 },
                '& .MuiSvgIcon-root': { fontSize: 18 },
              },
            }}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          maxHeight: VISIBLE_VARIANT_ROWS * VARIANT_ROW_H_PX,
          overflowY: 'auto',
          pr: 1,
        }}
        aria-label="Profil Çeşidi"
      >
        {variantsFiltered.length > 0 ? (
          <FormGroup>
            {variantsFiltered.map((v) => (
              <FormControlLabel
                key={v.key}
                control={
                  <Checkbox
                    checked={variantsSel.includes(v.key)}
                    onChange={() =>
                      setVariantsSel((prev) =>
                        prev.includes(v.key) ? prev.filter((x) => x !== v.key) : [...prev, v.key],
                      )
                    }
                  />
                }
                label={v.name}
              />
            ))}
          </FormGroup>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Sonuç yok
          </Typography>
        )}
      </Box>
    </Box>
  );
}
