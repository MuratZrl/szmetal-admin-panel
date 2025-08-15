// app/products/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Container, Box } from '@mui/material';
import ProductFormSection from './ProductFormSection';

export default function ProductEditPage() {
  const { id } = useParams() as { id?: string };

  if (!id) return <Box>Geçersiz ürün ID.</Box>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ProductFormSection id={id} />
    </Container>
  );
}
