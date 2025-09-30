// src/features/products/components/ProductsGrid.client.tsx
'use client';
import * as React from 'react';
import { Grid } from '@mui/material';
import ProductCard from '@/features/products/components/ProductCard.client';
import type { Product } from '@/features/products/types';

export default function ProductsGrid({
  products,
  mediaUrlsById,
}: {
  products: Product[];
  mediaUrlsById: Record<string, string | null>;
}) {
  return (
    <Grid container spacing={2}>
      {products.map((p) => {
        const url = mediaUrlsById[String(p.id)] ?? null;
        return (
          <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <ProductCard product={p} resolvedImageUrl={url} />
          </Grid>
        );
      })}
    </Grid>
  );
}
