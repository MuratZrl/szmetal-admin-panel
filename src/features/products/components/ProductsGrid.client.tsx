'use client';

import * as React from 'react';
import { Box, Grid } from '@mui/material';

import { PRODUCT_CARD_WIDTH_PX } from '@/features/products/components/ui/constants/constants';

import ProductCard from '@/features/products/components/ui/ProductCard/ProductCard.client';
import type { Product } from '@/features/products/types';
import type { LabelMaps } from '@/features/products/services/labelMaps.server';

type Role = 'Admin' | 'Manager' | 'User';

type Props = {
  products: Product[];
  mediaUrlsById: Record<string, string | null>;
  labels?: LabelMaps;
  role?: Role | string | null;
};

export default function ProductsGrid({ products, mediaUrlsById, labels, role }: Props) {
  return (
    <Grid container spacing={1} justifyContent="flex-start" alignItems="stretch">
      {products.map((p) => {
        const url = mediaUrlsById[String(p.id)] ?? null;

        return (
          <Grid key={String(p.id)} size={{ xs: 12, sm: 'auto', md: 'auto' }} sx={{ display: 'flex' }}>
            <Box sx={{ width: { xs: '100%', sm: PRODUCT_CARD_WIDTH_PX }, maxWidth: '100%' }}>
              <ProductCard product={p} resolvedImageUrl={url} role={role ?? null} labels={labels} />
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
