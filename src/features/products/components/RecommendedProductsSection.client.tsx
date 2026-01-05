// src/features/products/components/RecommendedProductsSection.client.tsx
'use client'

import * as React from 'react';
import { Box, Grid, Stack, Typography, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';

import ProductCard from '@/features/products/components/ui/ProductCard/ProductCard.client';
import type { Product } from '@/features/products/types';
import type { LabelMaps } from '@/features/products/services/labelMaps.server';

type Props = {
  title?: string;
  products: Product[];
  mediaUrlsById: Record<string, string | null>;
  labels: LabelMaps;
  role?: string | null;
  maxCards?: number; // opsiyonel: default 4
};

export default function RecommendedProductsSection({
  title = 'İlgili Profiller',
  products,
  mediaUrlsById,
  labels,
  role,
  maxCards = 4,
}: Props): React.JSX.Element | null {
  const items = (products ?? []).slice(0, Math.max(1, maxCards));
  if (items.length === 0) return null;

  return (
    <Box
      mt={3}
      sx={(t) => ({
        borderRadius: 2,
        border: `1px solid ${t.palette.divider}`,
        backgroundColor:
          t.palette.mode === 'dark'
            ? alpha(t.palette.background.paper, 0.35)
            : alpha(t.palette.background.paper, 0.85),
        backdropFilter: 'saturate(100%)',
        overflow: 'hidden',
      })}
    >
      <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1.25, sm: 1.5 } }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            {title}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {items.length} ürün
          </Typography>
        </Stack>

        <Divider sx={{ mt: 1.25 }} />
      </Box>

      <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
        <Grid container spacing={{ xs: 1.25, sm: 1.5, md: 2 }} alignItems="stretch">
          {items.map((p) => {
            const resolved = mediaUrlsById[String(p.id)] ?? null;

            return (
              <Grid
                key={String(p.id)}
                size={{ xs: 12, sm: 6, md: 3 }}
                sx={{ display: 'flex' }} // item içini esnet
              >
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ProductCard
                      product={p}
                      role={role ?? null}
                      labels={labels}
                      resolvedImageUrl={resolved}
                    />
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
