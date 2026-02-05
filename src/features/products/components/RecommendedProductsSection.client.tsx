'use client';

import * as React from 'react';
import { Box, Grid, Stack, Typography, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { PRODUCT_CARD_WIDTH_PX } from '@/features/products/components/ui/constants/constants';

import ProductCard from '@/features/products/components/ui/ProductCard/ProductCard.client';
import type { Product } from '@/features/products/types';
import type { LabelMaps } from '@/features/products/services/labelMaps.server';

type Props = {
  title?: string;
  products: Product[];
  mediaUrlsById: Record<string, string | null>;
  labels: LabelMaps;
  role?: string | null;
  maxCards?: number;
};

export default function RecommendedProductsSection({
  title = 'İlgili Profiller',
  products,
  mediaUrlsById,
  labels,
  role,
  maxCards = 5,
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
        <Stack direction="row" alignItems="baseline" justifyContent="flex-start" spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            {title}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {items.length} Ürün
          </Typography>
        </Stack>

        <Divider sx={{ mt: 1.25 }} />
      </Box>

      <Box sx={{ px: 0, pb: { xs: 1.5, sm: 2 } }}>
        <Grid container spacing={1} justifyContent= "center" alignItems="stretch">
          {items.map((p) => {
            const resolved = mediaUrlsById[String(p.id)] ?? null;

            return (
              <Grid key={String(p.id)} size={{ xs: 12, sm: 'auto', md: 'auto' }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: { xs: '100%', sm: PRODUCT_CARD_WIDTH_PX }, maxWidth: '100%' }}>
                  <ProductCard
                    product={p}
                    role={role ?? null}
                    labels={labels}
                    resolvedImageUrl={resolved}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
