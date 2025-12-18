// app/(admin)/products/[id]/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { Box, Grid, Stack } from '@mui/material';

// ✅ ESKİYİ SİL
// import { requirePageAccess } from '@/lib/supabase/auth/server';

// ✅ YENİ
import { requirePageAccess, getSessionInfo } from '@/lib/supabase/auth/guards.server';

import { fetchProductById } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import { fetchProductComments } from '@/features/products/comments/services/fetchComments.server';

import { resolveStorageUrl } from '@/features/products/services/resolveStorageUrl.server';
import { withVersion } from '@/features/products/utils/url';

import { mapRowToProduct } from '@/features/products/types';

import ProductMedia from '@/features/products/components/ProductMedia.client';
import ProductInfo from '@/features/products/components/ProductInfo.client';
import ProductDetailActions from '@/features/products/components/ProductDetailActions.client';
import CommentSection from '@/features/products/components/CommentSection.client';

import RecommendedProductsSection from '@/features/products/components/RecommendedProductsSection.client';
import { buildRecommendedBlock } from '@/features/products/services/recommendedBlock.server';

import { buildLabelMaps } from '@/features/products/services/labelMaps.server';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // ✅ eskiden: await requirePageAccess('products');
  // ✅ artık path ver
  await requirePageAccess('/products');

  const { id } = await params;
  const row = await fetchProductById(id);
  if (!row) return { title: 'Ürün bulunamadı' };

  const p = mapRowToProduct(row);
  return { title: `${p.code} — ${p.name}` };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  // ✅ Bu sayfanın gerçek path’i ile kontrol et
  const canonicalPath = `/products/${encodeURIComponent(id)}` as const;
  const { profile } = await requirePageAccess(canonicalPath);

  const [session, row, dicts] = await Promise.all([
    getSessionInfo(),
    fetchProductById(id),
    fetchProductDicts(),
  ]);

  if (!row) notFound();

  if (canonicalPath !== `/products/${id}`) {
    redirect(canonicalPath as `/products/${string}`);
  }

  const canEdit = profile.role === 'Admin' || profile.role === 'Manager';
  const canPin = profile.role === 'Admin';

  const product = mapRowToProduct(row);
  const labelMaps = buildLabelMaps(dicts);

  const preferPdf =
    (product.fileExt ?? '').toLowerCase() === 'pdf' && !!product.filePath;
  const rawPrimary = preferPdf ? product.filePath : product.image;
  const rawSecondary = preferPdf ? product.image : product.filePath;

  const versionKey = product.updatedAt ?? product.createdAt ?? null;

  const [basePrimary, baseSecondary, comments, recommended] = await Promise.all([
    (async () => withVersion(await resolveStorageUrl(rawPrimary), versionKey))(),
    (async () => withVersion(await resolveStorageUrl(rawSecondary), versionKey))(),
    fetchProductComments(String(product.id)),
    buildRecommendedBlock({ currentRow: row, limit: 4 }),
  ]);

  const allowed = ['pdf', 'png', 'webp', 'jpg', 'jpeg'] as const;
  type AllowedExt = (typeof allowed)[number];
  const extLower = (product.fileExt ?? '').toLowerCase();
  const mediaExt: AllowedExt | null = (allowed as readonly string[]).includes(extLower)
    ? (extLower as AllowedExt)
    : null;

  return (
    <Box px={1} py={1}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProductMedia
            src={basePrimary}
            fileUrl={baseSecondary}
            fileExt={mediaExt}
            fileMime={product.fileMime ?? null}
            aspectRatio={1 / Math.sqrt(2)}
            objectFit="contain"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <ProductInfo
              title={`${product.code} — ${product.name}`}
              code={product.code}
              variant={product.variant}
              category={product.category}
              subCategory={product.subCategory ?? undefined}
              date={product.date}
              revisionDate={product.revisionDate || ''}
              createdAt={row.created_at ?? null}
              id={String(product.id)}
              drawer={product.drawer}
              control={product.control}
              scale={product.scale}
              outerSizeMm={product.outerSizeMm}
              sectionMm2={product.sectionMm2}
              unit_weight_g_pm={
                typeof product.unit_weight_g_pm === 'number'
                  ? product.unit_weight_g_pm
                  : undefined
              }
              has_customer_mold={row.has_customer_mold}
              availability={product.availability}
              hasCustomerMold={product.hasCustomerMold}
              tempCode={product.tempCode}
              manufacturerCode={product.manufacturerCode}
              labels={{
                category: labelMaps.category,
                subCategory: labelMaps.subcategory,
                variant: labelMaps.variant,
              }}
              mediaSrc={basePrimary}
              mediaFileUrl={baseSecondary}
              mediaExt={mediaExt}
              mediaMime={product.fileMime ?? null}
              description={product.description}
            >

              <ProductDetailActions
                id={String(product.id)}
                canEdit={canEdit}
                code={product.code}
              />

            </ProductInfo>

            <CommentSection
              productId={String(product.id)}
              currentUserId={session.userId}
              currentUserUsername={session.username}
              currentUserEmail={session.email}
              currentUserAvatarUrl={session.avatarUrl}
              initialComments={comments}
              canPin={canPin}
            />
          </Stack>
        </Grid>
      </Grid>
      
      <RecommendedProductsSection
        products={recommended.products}
        mediaUrlsById={recommended.mediaUrlsById}
        labels={labelMaps}
        role={profile.role}
      />
      
    </Box>
  );
}
