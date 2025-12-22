// src/features/products/components/ui/Filter/sections/VariantFilterSection.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
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
}: VariantFilterSectionProps): React.JSX.Element {
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

  const selectedSet = React.useMemo(() => new Set<string>(variantsSel), [variantsSel]);

  const toggleVariant = React.useCallback(
    (key: string) => {
      setVariantsSel((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
    },
    [setVariantsSel],
  );

  const isActive = variantsSel.length > 0 || variantQuery.trim().length > 0;

  const handleClear = React.useCallback(() => {
    onChangeVariantQuery('');
    setVariantsSel([]);
  }, [onChangeVariantQuery, setVariantsSel]);

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
          Profil Çeşidi
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

      <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
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
          <List dense disablePadding>
            {variantsFiltered.map((v, idx) => {
              const label = (v.name ?? '').trim() ? (v.name as string) : v.key;
              const checked = selectedSet.has(v.key);

              return (
                <React.Fragment key={v.key}>
                  <ListItemButton
                    disableRipple
                    disableTouchRipple
                    onClick={() => toggleVariant(v.key)}
                    sx={{
                      pl: 1.25,
                      pr: 1,
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 1,
                      minHeight: VARIANT_ROW_H_PX,
                    }}
                  >
                    <FormControlLabel
                      sx={{ m: 0, width: 1 }}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleVariant(v.key);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label={<ListItemText primary={label} />}
                    />
                  </ListItemButton>

                  {idx < variantsFiltered.length - 1 ? <Divider sx={{ my: 0.75 }} /> : null}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Sonuç yok
          </Typography>
        )}
      </Box>
    </Box>
  );
}
