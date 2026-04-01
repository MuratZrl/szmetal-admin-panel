'use client';
// src/features/products/components/ProductsToolbar.client.tsx

import * as React from 'react';
import Link from '@/components/Link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Route } from 'next';

import { Grid, Stack, Button, Typography, IconButton, Tooltip, Chip, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

type Perms = { canCreate: boolean };

type Props = {
  perms: Perms;
  totalCount?: number | null;
  onOpenFilters?: () => void;
};

type ActiveFilter = {
  key: string;
  label: string;
  param: string;       // URL param name to remove
  paramValue?: string;  // specific value to remove (for multi-value params)
};

const SORT_LABELS: Record<string, string> = {
  'date-asc': 'Tarih (Eski → Yeni)',
  'weight-asc': 'Ağırlık (Düşük → Yüksek)',
  'weight-desc': 'Ağırlık (Yüksek → Düşük)',
  'code-asc': 'Kod (A → Z)',
  'code-desc': 'Kod (Z → A)',
};

function buildActiveFilters(sp: URLSearchParams): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  const q = sp.get('q')?.trim();
  if (q) {
    filters.push({ key: 'q', label: `Arama: "${q}"`, param: 'q' });
  }

  const categories = sp.getAll('category').filter(Boolean);
  for (const c of categories) {
    filters.push({ key: `cat-${c}`, label: `Kategori: ${c}`, param: 'category', paramValue: c });
  }

  const subCategories = sp.getAll('subCategory').filter(Boolean);
  for (const s of subCategories) {
    filters.push({ key: `sub-${s}`, label: `Alt Kategori: ${s}`, param: 'subCategory', paramValue: s });
  }

  const variants = sp.getAll('variants').filter(Boolean);
  for (const v of variants) {
    filters.push({ key: `var-${v}`, label: `Varyant: ${v}`, param: 'variants', paramValue: v });
  }

  const mold = sp.get('customerMold');
  if (mold) {
    const label = mold === 'Evet' ? 'Müşteri Kalıbı: Evet' : 'Müşteri Kalıbı: Hayır';
    filters.push({ key: 'mold', label, param: 'customerMold' });
  }

  const avail = sp.get('availability');
  if (avail) {
    const label = avail === '1' ? 'Kullanılabilirlik: Evet' : 'Kullanılabilirlik: Hayır';
    filters.push({ key: 'avail', label, param: 'availability' });
  }

  const updatedFrom = sp.get('updatedFrom');
  if (updatedFrom) {
    filters.push({ key: 'updatedFrom', label: `Güncelleme Baş.: ${updatedFrom}`, param: 'updatedFrom' });
  }

  const updatedTo = sp.get('updatedTo');
  if (updatedTo) {
    filters.push({ key: 'updatedTo', label: `Güncelleme Bitiş: ${updatedTo}`, param: 'updatedTo' });
  }

  const from = sp.get('from');
  if (from) {
    filters.push({ key: 'from', label: `Eklenme Baş.: ${from}`, param: 'from' });
  }

  const to = sp.get('to');
  if (to) {
    filters.push({ key: 'to', label: `Eklenme Bitiş: ${to}`, param: 'to' });
  }

  const sort = sp.get('sort');
  if (sort && SORT_LABELS[sort]) {
    filters.push({ key: 'sort', label: `Sıralama: ${SORT_LABELS[sort]}`, param: 'sort' });
  }

  return filters;
}

export default function ProductsToolbar({ perms, totalCount, onOpenFilters }: Props): React.JSX.Element {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const formattedTotal = React.useMemo(() => {
    const n = typeof totalCount === 'number' ? totalCount : Number(totalCount);
    return Number.isFinite(n) && n >= 0 ? new Intl.NumberFormat('tr-TR').format(n) : '0';
  }, [totalCount]);

  const showFilters = typeof onOpenFilters === 'function';

  const activeFilters = React.useMemo(() => buildActiveFilters(new URLSearchParams(sp.toString())), [sp]);

  const handleRemoveFilter = React.useCallback(
    (filter: ActiveFilter) => {
      const next = new URLSearchParams(sp.toString());

      if (filter.paramValue) {
        // Multi-value param: remove only the specific value
        const values = next.getAll(filter.param).filter((v) => v !== filter.paramValue);
        next.delete(filter.param);
        for (const v of values) next.append(filter.param, v);
      } else {
        next.delete(filter.param);
      }

      // Reset to page 1 when removing a filter
      next.delete('page');

      const qs = next.toString();
      const href = (qs ? `${pathname}?${qs}` : pathname) as Route;
      router.replace(href, { scroll: false });
    },
    [sp, pathname, router],
  );

  const handleClearAll = React.useCallback(() => {
    // Keep only pageSize
    const next = new URLSearchParams();
    const pageSize = sp.get('pageSize');
    if (pageSize) next.set('pageSize', pageSize);

    const qs = next.toString();
    const href = (qs ? `${pathname}?${qs}` : pathname) as Route;
    router.replace(href, { scroll: false });
  }, [sp, pathname, router]);

  return (
    <Stack spacing={1} sx={{ mb: 1 }}>
      <Grid container alignItems="center" spacing={1}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ minWidth: 0 }}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: 18, sm: 22 },
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Ürünleri Listele
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              aria-live="polite"
              aria-atomic
              sx={{ flexShrink: 0 }}
            >
              ({formattedTotal} ürün)
            </Typography>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {smUp ? (
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              sx={{ gap: 1.25, flexWrap: 'wrap', '& > *': { minWidth: 0 } }}
            >
              {showFilters && (
                <Button
                  onClick={onOpenFilters}
                  variant="outlined"
                  size="small"
                  startIcon={<FilterAltOutlinedIcon />}
                  draggable={false}
                >
                  Filtreler
                </Button>
              )}

              {perms.canCreate && (
                <Button
                  component={Link}
                  href="/products/new"
                  variant="text"
                  color="contrast"
                  size="small"
                  startIcon={<AddIcon />}
                  draggable={false}
                >
                  Yeni Ürün Ekle
                </Button>
              )}
            </Stack>
          ) : (
            <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
              {showFilters && (
                <Tooltip title="Filtreler">
                  <IconButton onClick={onOpenFilters} color="primary" aria-label="Filtreleri Aç">
                    <FilterAltOutlinedIcon />
                  </IconButton>
                </Tooltip>
              )}

              {perms.canCreate && (
                <Tooltip title="Yeni Ürün Ekle">
                  <IconButton component={Link} href="/products/new" color="primary" aria-label="Yeni Ürün Ekle">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>

      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          {activeFilters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              size="small"
              variant="outlined"
              onDelete={() => handleRemoveFilter(f)}
              sx={{
                borderRadius: 1.5,
                fontSize: 12,
                fontWeight: 500,
              }}
            />
          ))}

          <Chip
            label="Tümünü Temizle"
            size="small"
            color="error"
            variant="outlined"
            onClick={handleClearAll}
            sx={{
              borderRadius: 1.5,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          />
        </Box>
      )}
    </Stack>
  );
}
