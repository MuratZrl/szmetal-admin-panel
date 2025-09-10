// app/(admin)/products/[id]/page.tsx
import { createServerClient } from '@supabase/ssr';

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Box, Grid } from '@mui/material';

import { fetchProductById } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';

import ProductInfo from '@/features/products/components/ProductInfo';
import ProductPrintBlock from '@/features/products/print/ProductPDF';
import ProductMedia from '@/features/products/components/ProductMedia';
import ProductHeader from '@/features/products/components/ProductHeader';
import ProductDetailActions from '@/features/products/components/ProductDetailActions';

import { mapRowToProduct } from '@/features/products/types/product';
import { buildCategoryHelpers } from '@/features/products/forms/helpers';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; // ← Next 15 "sync dynamic APIs" dramını keser
  const row = await fetchProductById(id);
  if (!row) return { title: 'Ürün bulunamadı' };
  const p = mapRowToProduct(row);
  return { title: `${p.code} — ${p.name}` };
}

async function getRole(): Promise<'Admin' | 'User' | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {}, remove() {},
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
  return data?.role ?? null;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const role = await getRole();
  const canEdit = role === 'Admin';

  const [row, dicts] = await Promise.all([
    fetchProductById(id),
    fetchProductDicts(),
  ]);

  if (!row) notFound();

  // DB → domain (camelCase + türetilmiş alanlar)
  const product = mapRowToProduct(row);

  // Label map’leri (slug → görünen ad)
  const { categoryLabelMap, subLabelMap } = buildCategoryHelpers(dicts.categoryTree);
  const variantLabelMap = Object.fromEntries(dicts.variants.map(v => [v.key, v.name] as const));

  // Print bloğu için satırlar
  const rows = [
    { label: 'Varyant', value: variantLabelMap[product.variant] ?? product.variant },
    {
      label: 'Kategori',
      value: [categoryLabelMap.get(product.category), subLabelMap.get(product.subCategory ?? '')]
        .filter(Boolean)
        .join(' / ') || '-',
    },
    { label: 'Tarih', value: product.date },
    { label: 'ID', value: String(product.id) },

    product.drawer && { label: 'Çizen', value: product.drawer },
    product.control && { label: 'Kontrol', value: product.control },
    product.tempCode && { label: 'Geçici Kod', value: product.tempCode },
    product.profileCode && { label: 'Profil Kodu', value: product.profileCode },
    product.manufacturerCode && { label: 'Üretici Kodu', value: product.manufacturerCode },
    product.scale && { label: 'Ölçek', value: product.scale },

    typeof product.outerSizeMm === 'number' && {
      label: 'Dış Çevre (mm)',
      value: product.outerSizeMm.toLocaleString('tr-TR'),
    },
    typeof product.sectionMm2 === 'number' && {
      label: 'Kesit (mm²)',
      value: product.sectionMm2.toLocaleString('tr-TR'),
    },
    typeof product.unit_weight_g_pm === 'number' && {
      label: 'Birim Ağırlığı (gr/m)',
      value: product.unit_weight_g_pm.toLocaleString('tr-TR'),
    },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <Box px={2} py={2}>
      <ProductHeader code={product.code} name={product.name} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ProductMedia
            src={product.image ?? null}
            fileUrl={product.filePublicUrl ?? null}  // mapRowToProduct bunu üretiyor olmalı
            fileExt={product.fileExt ?? null}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <ProductInfo
            variant={product.variant}
            category={product.category}
            subCategory={product.subCategory ?? undefined}
            date={product.date}
            id={String(product.id)}

            // teknik
            drawer={product.drawer}
            control={product.control}
            scale={product.scale}
            outerSizeMm={product.outerSizeMm}
            sectionMm2={product.sectionMm2}
            unit_weight_g_pm={typeof product.unit_weight_g_pm === 'number' ? product.unit_weight_g_pm : undefined}
            tempCode={product.tempCode}
            profileCode={product.profileCode}
            manufacturerCode={product.manufacturerCode}

            // slug → label çöz
            labels={{
              category: Object.fromEntries(categoryLabelMap),
              subCategory: Object.fromEntries(subLabelMap),
              variant: variantLabelMap,
            }}

            footerSlot={<ProductDetailActions id={String(product.id)} canEdit={canEdit} />}
          />
        </Grid>
      </Grid>

      <ProductPrintBlock
        rows={rows}
        title={`${product.code} — ${product.name}`}
      />
    </Box>
  );
}
