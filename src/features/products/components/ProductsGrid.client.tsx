'use client';
// src/features/products/components/ProductsGrid.client.tsx

import * as React from 'react';
import { Box, Grid } from '@mui/material';

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

export default function ProductsGrid({ products, mediaUrlsById, labels, role }: Props): React.JSX.Element {
  return (
    <Grid container spacing={{ xs: 1, sm: 1.25 }} alignItems="stretch">
      {products.map((p) => {
        const url = mediaUrlsById[String(p.id)] ?? null;

        return (
          <Grid
            key={String(p.id)}
            size={{ xs: 12, sm: 6, md: 3 }} // xs: 1 kolon, sm: 2 kolon, md+: 4 kolon
            sx={{ display: 'flex' }}
          >
            <Box sx={{ width: '100%', minWidth: 0, display: 'flex' }}>
              <ProductCard product={p} resolvedImageUrl={url} role={role ?? null} labels={labels} />
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
