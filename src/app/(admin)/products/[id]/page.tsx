// app/(admin)/products/[id]/page.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Box, Grid } from '@mui/material';

import { fetchProductById } from '@/features/products/services/products.server';
import ProductHeader from '@/features/products/components/ProductHeader';
import ProductMedia from '@/features/products/components/ProductMedia';
import ProductInfo from '@/features/products/components/ProductInfo';
import ProductDetailActions from '@/features/products/components/ProductDetailActions';
import ProductPrintBlock from '@/features/products/print/ProductPDF';

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await props.params;     // <<< önemli
  const p = await fetchProductById(id);
  if (!p) return { title: 'Ürün bulunamadı' };
  return { title: `${p.code} — ${p.name}` };
}

export default async function ProductDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;     // <<< önemli
  const product = await fetchProductById(id);
  if (!product) notFound();

  const rows = [
    { label: 'Variant', value: product.variant },
    { label: 'Kategori', value: `${product.category} / ${product.subCategory}` },
    { label: 'Ağırlık', value: `${product.unitWeightKg.toFixed(2)} kg` },
    { label: 'Tarih', value: product.date },
    { label: 'ID', value: String(product.id) },
    product.displayName && { label: 'İsim', value: product.displayName },
    product.tempCode && { label: 'Geçici Kod', value: product.tempCode },
    product.profileCode && { label: 'Profil Kodu', value: product.profileCode },
    product.manufacturerCode && { label: 'Üretici Kodu', value: product.manufacturerCode },
    product.drawer && { label: 'Çizen', value: product.drawer },
    product.control && { label: 'Kontrol', value: product.control },
    product.scale && { label: 'Ölçek', value: product.scale },
    typeof product.outerSizeMm === 'number' && {
      label: 'Dış Çevre (mm)', value: product.outerSizeMm.toLocaleString('tr-TR')
    },
    typeof product.sectionMm2 === 'number' && {
      label: 'Kesit (mm²)', value: product.sectionMm2.toLocaleString('tr-TR')
    },
    typeof product.unitWeightGrPerM === 'number' && {
      label: 'Birim Ağırlığı (gr/m)', value: product.unitWeightGrPerM.toLocaleString('tr-TR')
    },
  ].filter(Boolean) as { label: string; value: ReactNode }[];

  return (
    <Box px={2} py={2}>
      <ProductHeader code={product.code} name={product.name} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ProductMedia
            // Bu bileşen artık sadece PDF gömüyor. raster/diğerleri için "önizleme yok".
            src={product.image}
            fileUrl={product.filePublicUrl}
            fileExt={product.fileExt}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <ProductInfo
            variant={product.variant}
            category={product.category}
            subCategory={product.subCategory}
            unitWeightKg={product.unitWeightKg}
            date={product.date}
            id={String(product.id)}
            drawer={product.drawer}
            control={product.control}
            scale={product.scale}
            outerSizeMm={product.outerSizeMm}
            sectionMm2={product.sectionMm2}
            unitWeightGrPerM={product.unitWeightGrPerM}
            displayName={product.displayName}
            tempCode={product.tempCode}
            profileCode={product.profileCode}
            manufacturerCode={product.manufacturerCode}
            footerSlot={<ProductDetailActions id={String(product.id)} />}
          />
        </Grid>
      </Grid>

      {/* PRINT BLOĞU: PDF ise link göster, resim yok */}
      <ProductPrintBlock
        rows={rows}
        title={`${product.code} — ${product.name}`}
      />
    </Box>
  );
}
