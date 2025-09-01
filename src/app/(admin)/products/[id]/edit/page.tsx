// app/(admin)/products/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Box, Grid, Divider, Typography } from '@mui/material';
import { revalidatePath } from 'next/cache';

import { fetchProductById, updateProduct } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/dicts.server';
import ProductEditForm, { type ProductEditValues } from '@/features/products/components/ProductEditForm.client';

type Params = { id: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = params;
  const p = await fetchProductById(id);
  return { title: p ? `${p.code} — Düzenle` : 'Ürün bulunamadı' };
}

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = params;

  // Ürün + sözlükleri paralel çek
  const [product, dicts] = await Promise.all([
    fetchProductById(id),
    fetchProductDicts(),
  ]);

  if (!product) notFound();

  // Server Action
  async function saveAction(values: ProductEditValues) {
    'use server';

    await updateProduct(id, {
      displayName: values.displayName,
      name: values.name,
      code: values.code,
      variant: values.variant,
      category: values.category,
      subCategory: values.subCategory,
      unitWeightKg: values.unitWeightKg,
      date: values.date,

      // ↓↓↓ kritik: null → undefined
      drawer: values.drawer ?? undefined,
      control: values.control ?? undefined,
      scale: values.scale ?? undefined,

      outerSizeMm: values.outerSizeMm ?? undefined,
      sectionMm2: values.sectionMm2 ?? undefined,
      unitWeightGrPerM: values.unitWeightGrPerM ?? undefined,

      tempCode: values.tempCode ?? undefined,
      profileCode: values.profileCode ?? undefined,
      manufacturerCode: values.manufacturerCode ?? undefined,

      image: values.image,
    });

    revalidatePath(`/products/${id}`);
    revalidatePath(`/products`);
    redirect(`/products/${id}`);
  }


  return (
    <Box px={2} py={2}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {product.code} — Düzenle
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ProductEditForm
            initial={{
              displayName: product.displayName ?? product.name,
              name: product.name,
              code: product.code,
              variant: product.variant,
              category: product.category,
              subCategory: product.subCategory,
              unitWeightKg: product.unitWeightKg,
              date: product.date,

              drawer: product.drawer ?? '',
              control: product.control ?? '',
              scale: product.scale ?? '',

              outerSizeMm: product.outerSizeMm ?? null,
              sectionMm2: product.sectionMm2 ?? null,
              unitWeightGrPerM: product.unitWeightGrPerM ?? null,

              tempCode: product.tempCode ?? '',
              profileCode: product.profileCode ?? '',
              manufacturerCode: product.manufacturerCode ?? '',

              image: product.image ?? '',
            }}
            onSave={saveAction}
            // <<< KRİTİK: dicts'ten gelen props'lar
            categories={dicts.categories}
            variants={dicts.variants}
            categoryTree={dicts.categoryTree}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
