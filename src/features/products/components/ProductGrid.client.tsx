// src/features/products/components/ProductsGrid.client.tsx
'use client';

import * as React from 'react';
import { Grid } from '@mui/material';
import ProductCard from '@/features/products/components/ProductCard.client';
import type { Product } from '../types/product';

export default function ProductsGrid({ products, density = 'comfortable' }: { products: Product[]; density?: 'comfortable'|'compact'; }) {
  const mdCols = density === 'compact' ? 4 : 3;
  return (
    <Grid container spacing={2}>
      {products.map(p => (
        <Grid key={p.id} size={{ xs: 12, sm: 6, md: 12 / mdCols }}>
          <ProductCard product={p} />
        </Grid>
      ))}
    </Grid>
  );
}
