// app/(admin)/products/page.tsx

'use client';

import { Box, Grid } from '@mui/material';

import ProductCard from 'features/products/components/ProductCard.client';

import { products } from '@/constants/productcards';

export default function ProductsPage() {
  return (
    <Box py={2} >

      <Grid container spacing={3}>
        {products.map((product, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }} >
            <ProductCard
              imageSrc={product.imageSrc}
              title={product.title}
              slug={product.slug}
            />
          </Grid>
        ))}
      </Grid>
      
    </Box>
  );
}
