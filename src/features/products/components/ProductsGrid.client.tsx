// src/features/products/components/ProductsGrid.client.tsx
'use client';
import * as React from 'react';
import { Grid } from '@mui/material';
import ProductCard from '@/features/products/components/ProductCard.client';
import type { Product } from '../model';

export default function ProductsGrid({ products }: { products: Product[] }) {
  return (
    <Grid container spacing={2}>
      {products.map((p) => (
        <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
          <ProductCard product={p} />
        </Grid>
      ))}
    </Grid>
  );
}
