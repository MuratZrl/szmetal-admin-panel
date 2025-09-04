// app/(admin)/products/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Box, Grid, Divider, Typography } from '@mui/material';
import { revalidatePath } from 'next/cache';

import { fetchProductById, updateProduct } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/dicts.server';
import ProductEditForm, { type ProductEditValues } from '@/features/products/components/ProductEditForm.client';

// 1) params Promise olacak
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await fetchProductById(id);
  return { title: p ? `${p.code} — Düzenle` : 'Ürün bulunamadı' };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  // Ürün + sözlükleri paralel çek
  const [product, dicts] = await Promise.all([
    fetchProductById(id),
    fetchProductDicts(),
  ]);

  if (!product) notFound();

  // ————————————————————————————————
  // SÖZLÜKLERİ eski API'ye dönüştür
  // ————————————————————————————————
  // VariantOption[] -> string[] (değer olarak KEY kullanıyoruz)
  const variantKeys = dicts.variants.map(v => v.key) satisfies string[];

  // { [cat]: { name, subs: [{slug,name}...] } } -> Record<string, string[]>
  const legacyCategoryTree = Object
    .entries(dicts.categoryTree)
    .map(([slug, node]) => [slug, node.subs.map(s => s.slug)] as const);
  
    const categoryTreeForForm = Object.fromEntries(legacyCategoryTree) satisfies Record<string, string[]>;
  // İstersen isimleri göstermek için ayrıca bir map de tutabilirsin; forma şu an sadece slug[] gidiyor.

  // Server Action
  async function saveAction(values: ProductEditValues) {
    'use server';

    await updateProduct(id, {
      name: values.name,
      code: values.code,
      variant: values.variant,
      category: values.category,
      subCategory: values.subCategory,
      date: values.date,
      
      // ↓↓↓ kritik: null → undefined
      drawer: values.drawer ?? undefined,
      control: values.control ?? undefined,
      unit_weight_g_pm: values.unit_weight_g_pm ?? 0,
      scale: values.scale ?? undefined,

      outerSizeMm: values.outerSizeMm ?? undefined,
      sectionMm2: values.sectionMm2 ?? undefined,

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
              name: product.name,
              code: product.code,
              variant: product.variant,
              category: product.category,
              subCategory: product.subCategory,
              unit_weight_g_pm: product.unit_weight_g_pm,
              date: product.date,

              drawer: product.drawer ?? '',
              control: product.control ?? '',
              scale: product.scale ?? '',

              outerSizeMm: product.outerSizeMm ?? null,
              sectionMm2: product.sectionMm2 ?? null,

              tempCode: product.tempCode ?? '',
              profileCode: product.profileCode ?? '',
              manufacturerCode: product.manufacturerCode ?? '',

              image: product.image ?? '',
            }}
            
            onSave={saveAction}

            // <<< KRİTİK: dicts'ten gelen props'lar
            categories={dicts.categories}
            variants={variantKeys}
            categoryTree={categoryTreeForForm}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
