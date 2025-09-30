// app/(admin)/products/[id]/page.tsx
import { createServerClient } from '@supabase/ssr';

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Box, Grid } from '@mui/material';

import { fetchProductById } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';

import ProductMedia from '@/features/products/components/ProductMedia';
import ProductInfo from '@/features/products/components/ProductInfo';
import ProductDetailActions from '@/features/products/components/ProductDetailActions';

import { withVersion } from '@/features/products/utils/url';
import { resolveStorageUrl } from '@/features/products/services/resolveStorageUrl.server';
import { mapRowToProduct } from '@/features/products/types';
import { buildCategoryHelpers } from '@/features/products/forms/helpers';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await fetchProductById(id);
  if (!row) return { title: 'Ürün bulunamadı' };
  const p = mapRowToProduct(row);
  return { title: `${p.code} — ${p.name}` };
}

async function getRole(): Promise<'Admin' | 'Manager' | 'User' | null> {
  const jar = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return jar.get(name)?.value; },
        set() {}, remove() {},
      },
    },
  );

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb.from('users').select('role').eq('id', user.id).single();
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

  // DB → UI
  const product = mapRowToProduct(row);

  // Etiket sözlükleri
  const { categoryLabelMap, subLabelMap } = buildCategoryHelpers(dicts.categoryTree);
  const variantLabelMap = Object.fromEntries(dicts.variants.map(v => [v.key, v.name] as const));

  // ---------- MEDYA SEÇİMİ + İMZALI URL ----------
  // Tercih: PDF varsa onu göster; yoksa image.
  const preferPdf = (product.fileExt ?? '').toLowerCase() === 'pdf' && !!product.filePath;
  const rawPrimary   = preferPdf ? product.filePath : product.image;   // path veya mutlak URL veya null
  const rawSecondary = preferPdf ? product.image   : product.filePath; // fallback

  // path → imzalı URL, public eski URL ise private bucket için yine imzalıyoruz
  const primaryUrlSigned   = await resolveStorageUrl(rawPrimary);
  const secondaryUrlSigned = await resolveStorageUrl(rawSecondary);

  // cache-busting (updatedAt yoksa createdAt)
  const verBase = product.updatedAt ?? product.createdAt ?? null;
  const primaryUrl   = withVersion(primaryUrlSigned, verBase);
  const secondaryUrl = withVersion(secondaryUrlSigned, verBase);

  // Tip ipucu (PDF mi, image mı?) – ProductMedia zaten kendisi de tespit ediyor;
  // biz yine de ext'i iletelim.
  const extLower = (product.fileExt ?? '').toLowerCase();
  const allowed = ['pdf', 'png', 'webp', 'jpg', 'jpeg'] as const;
  type AllowedExt = typeof allowed[number];
  const mediaExt: AllowedExt | null = (allowed as readonly string[]).includes(extLower)
    ? (extLower as AllowedExt)
    : null;

  return (
    <Box px={1} py={1}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProductMedia
            src={primaryUrl}              // Öncelikli (PDF ya da görsel)
            fileUrl={secondaryUrl}        // Yedek
            fileExt={mediaExt}
            fileMime={product.fileMime ?? null}
            aspectRatio={1 / Math.sqrt(2)}  // A4 oranı
            objectFit="contain"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ProductInfo
            title={`${product.code} — ${product.name}`}
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
            unit_weight_g_pm={
              typeof product.unit_weight_g_pm === 'number' ? product.unit_weight_g_pm : undefined
            }
            has_customer_mold={row.has_customer_mold}
            availability={product.availability}
            hasCustomerMold={product.hasCustomerMold}
            tempCode={product.tempCode}
            profileCode={product.profileCode}
            manufacturerCode={product.manufacturerCode}

            // slug → label çöz
            labels={{
              category: Object.fromEntries(categoryLabelMap),
              subCategory: Object.fromEntries(subLabelMap),
              variant: variantLabelMap,
            }}

            // medya action butonları aynı URL'leri kullansın
            mediaSrc={primaryUrl}
            mediaFileUrl={secondaryUrl}
            mediaExt={mediaExt}
            mediaMime={product.fileMime ?? null}

            description={product.description}
          >
            <ProductDetailActions id={String(product.id)} canEdit={canEdit} />
          </ProductInfo>
        </Grid>
      </Grid>
    </Box>
  );
}
