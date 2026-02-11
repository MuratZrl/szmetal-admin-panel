'use client';
// src/features/products/components/ProductsToolbar.client.tsx

import * as React from 'react';
import Link from '@/components/Link';

import { Grid, Stack, Button, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

type Perms = { canCreate: boolean };

type Props = {
  perms: Perms;
  totalCount?: number | null;
  onOpenFilters?: () => void; // opsiyonel: Drawer/Panel açmak için
};

export default function ProductsToolbar({ perms, totalCount, onOpenFilters }: Props): React.JSX.Element {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const formattedTotal = React.useMemo(() => {
    const n = typeof totalCount === 'number' ? totalCount : Number(totalCount);
    return Number.isFinite(n) && n >= 0 ? new Intl.NumberFormat('tr-TR').format(n) : '0';
  }, [totalCount]);

  const showFilters = typeof onOpenFilters === 'function';

  return (
    <Grid container alignItems="center" spacing={1} sx={{ mb: 1 }}>
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
  );
}
