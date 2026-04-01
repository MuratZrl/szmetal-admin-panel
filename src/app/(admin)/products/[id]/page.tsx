// app/(admin)/products/[id]/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { Box, Grid, Stack } from '@mui/material';

import { requirePageAccess, getSessionInfo } from '@/lib/supabase/auth/guards.server';

import {
  fetchProductById,
  fetchProductByIdWithCategoryChain,
} from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import { fetchProductComments } from '@/features/products/screen/detail/services/fetchComments.server';
import { fetchAdjacentProductIds } from '@/features/products/services/productNavigation.server';

import { mapRowToProduct } from '@/features/products/types';

import ProductMedia from '@/features/products/screen/detail/components/ProductMedia.client';
import ProductInfo from '@/features/products/screen/detail/ProductInfo';

import ProductDetailActions from '@/features/products/screen/detail/ProductInfo/ProductDetailActions.client';
import CommentSection from '@/features/products/screen/detail/components/CommentSection.client';

import RecommendedProductsSection from '@/features/products/components/RecommendedProductsSection.client';
import { buildRecommendedBlock } from '@/features/products/services/recommendedBlock.server';

import { buildLabelMaps } from '@/features/products/services/labelMaps.server';

import type { Database } from '@/types/supabase';

type ProductsRow = Database['public']['Tables']['products']['Row'];

type CategoryChain = {
  slug: string | null;
  parent: {
    slug: string | null;
    parent: {
      slug: string | null;
    } | null;
  } | null;
};

type ProductsRowWithChain = ProductsRow & {
  category?: CategoryChain | null;
  created_by_user?: { username: string | null } | null;
};

type Props = { params: Promise<{ id: string }> };

function enrichProductWithCategoryChain(row: ProductsRowWithChain) {
  const base = mapRowToProduct(row);

  const leaf = row.category?.slug ?? null;
  const parent = row.category?.parent?.slug ?? null;
  const grand = row.category?.parent?.parent?.slug ?? null;

  let category: string | null = null;
  let subCategory: string | null = null;
  let subSubCategory: string | null = null;

  if (leaf && parent && grand) {
    category = grand;
    subCategory = parent;
    subSubCategory = leaf;
  } else if (leaf && parent) {
    category = parent;
    subCategory = leaf;
    subSubCategory = null;
  } else if (leaf) {
    category = leaf;
    subCategory = null;
    subSubCategory = null;
  }

  return { ...base, category, subCategory, subSubCategory };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requirePageAccess('/products');

  const { id } = await params;

  const row = await fetchProductById(id);
  if (!row) return { title: 'Ürün bulunamadı' };

  const p = mapRowToProduct(row);
  return { title: `${p.code} — ${p.name}` };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const pageStart = Date.now();

  const canonicalPath = `/products/${encodeURIComponent(id)}` as const;

  const t0 = Date.now();
  const { profile } = await requirePageAccess(canonicalPath);
  console.log(`⏱ requirePageAccess: ${Date.now() - t0}ms`);

  const t1 = Date.now();
  const [session, rowWithChain, dicts] = await Promise.all([
    getSessionInfo(),
    fetchProductByIdWithCategoryChain(id),
    fetchProductDicts(),
  ]);
  console.log(`⏱ [session + product + dicts] batch: ${Date.now() - t1}ms`);

  if (!rowWithChain) notFound();

  if (canonicalPath !== `/products/${id}`) {
    redirect(canonicalPath as `/products/${string}`);
  }

  const canEdit = profile.role === 'Admin' || profile.role === 'Manager';
  const canPin = profile.role === 'Admin';

  const row = rowWithChain as ProductsRowWithChain;

  const createdByName = row.created_by_user?.username;
  if (!createdByName) {
    throw new Error(`created_by_user.username missing for product ${id}`);
  }

  const safeId = id;

  const createdAt = row.created_at;
  if (!createdAt) {
    throw new Error(`created_at missing for product ${id}`);
  }

  const product = enrichProductWithCategoryChain(row);
  const labelMaps = buildLabelMaps(dicts);

  const versionKey = product.updatedAt ?? product.createdAt ?? null;
  const v = versionKey ? `&v=${encodeURIComponent(versionKey)}` : '';

  const basePrimary = `/api/products/storage/${encodeURIComponent(safeId)}?slot=primary${v}`;
  const baseSecondary = `/api/products/storage/${encodeURIComponent(safeId)}?slot=secondary${v}`;

  // Run ALL remaining fetches in parallel — comments, recommended, AND adjacent
  const t2 = Date.now();
  const [commentsRaw, recommendedRaw, adjacent] = await Promise.all([
    fetchProductComments(safeId),
    buildRecommendedBlock({ currentRow: row as ProductsRow, limit: 5 }),
    fetchAdjacentProductIds({ id: safeId, createdAt }),
  ]);
  console.log(`⏱ [comments + recommended + adjacent] batch: ${Date.now() - t2}ms`);

  console.log(`⏱ TOTAL server time: ${Date.now() - pageStart}ms`);

  const comments = commentsRaw ?? [];
  const recommended = recommendedRaw ?? { products: [], mediaUrlsById: {} };

  const allowed = ['pdf', 'png', 'webp', 'jpg', 'jpeg'] as const;
  type AllowedExt = (typeof allowed)[number];
  const extLower = (product.fileExt ?? '').toLowerCase();

  const mediaExt: AllowedExt | null = (allowed as readonly string[]).includes(extLower)
    ? (extLower as AllowedExt)
    : null;

  type RowWithViews = ProductsRowWithChain & {
    view_count?: number | null;
    viewCount?: number | null;
  };

  const viewCount =
    (row as RowWithViews).view_count ??
    (row as RowWithViews).viewCount ??
    null;

  return (
    <Box px={1} py={1}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
          <ProductMedia
            src={basePrimary}
            fileUrl={baseSecondary}
            fileExt={mediaExt}
            fileMime={product.fileMime ?? null}
            aspectRatio={1 / Math.sqrt(2)}
            objectFit="contain"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
          <Stack spacing={2}>
            <ProductInfo
              title={`${product.code} — ${product.name}`}
              code={product.code}
              variant={product.variant}
              category={product.category}
              subCategory={product.subCategory ?? undefined}
              subSubCategory={product.subSubCategory ?? undefined}
              date={product.date}
              revisionDate={product.revisionDate ?? null}
              createdAt={row.created_at ?? null}
              updatedAt={row.updated_at ?? null}
              createdBy={createdByName}
              id={safeId}
              drawer={product.drawer}
              control={product.control}
              scale={product.scale}
              outerSizeMm={product.outerSizeMm}
              sectionMm2={product.sectionMm2}
              unit_weight_g_pm={
                typeof product.unit_weight_g_pm === 'number' ? product.unit_weight_g_pm : undefined
              }
              wallThicknessMm={product.wallThicknessMm}
              has_customer_mold={row.has_customer_mold}
              availability={product.availability}
              hasCustomerMold={product.hasCustomerMold}
              tempCode={product.tempCode}
              profileCode={product.code ?? null}
              manufacturerCode={product.manufacturerCode}
              labels={{
                category: labelMaps.category,
                subCategory: labelMaps.subcategory,
                subSubCategory: labelMaps.subSubCategory,
                variant: labelMaps.variant,
              }}
              mediaSrc={basePrimary}
              mediaFileUrl={baseSecondary}
              mediaExt={mediaExt}
              mediaMime={product.fileMime ?? null}
              description={product.description}
            >
              <ProductDetailActions
                id={safeId}
                canEdit={canEdit}
                code={product.code}
                newerProductId={adjacent.newerId}
                olderProductId={adjacent.olderId}
                viewCount={viewCount}
              />
            </ProductInfo>

            <CommentSection
              productId={safeId}
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