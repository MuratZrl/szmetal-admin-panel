// app/(admin)/products/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Box, Grid, Stack } from '@mui/material';

import { createSupabaseRSCClient } from '@/lib/supabase/supabaseServer';

import { fetchProductById } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import { fetchProductComments } from '@/features/products/comments/services/fetchComments.server';

import { withVersion } from '@/features/products/utils/url';
import { resolveAvatarUrl } from '@/features/products/comments/services/resolveAvatarUrl.server';

import { mapRowToProduct } from '@/features/products/types';
import { buildCategoryHelpers } from '@/features/products/forms/helpers';

import ProductMedia from '@/features/products/components/ProductMedia';
import ProductInfo from '@/features/products/components/ProductInfo';
import ProductDetailActions from '@/features/products/components/ProductDetailActions';
import CommentSection from '@/features/products/components/CommentSection.client';

import type { Tables } from '@/types/supabase';

const PRODUCT_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? 'product-media';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await fetchProductById(id);
  if (!row) return { title: 'Ürün bulunamadı' };

  const p = mapRowToProduct(row);
  return { title: `${p.code} — ${p.name}` };
}

/* ------------------------------------------------------------
 * Session info: role + userId + username + email + avatarUrl
 * ----------------------------------------------------------*/
type UserSlim = Pick<Tables<'users'>, 'role' | 'username' | 'email' | 'image' | 'updated_at'>;

async function getSessionInfo(): Promise<{
  role: 'Admin' | 'Manager' | 'User' | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
}> {
  const sb = await createSupabaseRSCClient();

  const { data: auth } = await sb.auth.getUser();
  const user = auth.user;
  if (!user) {
    return { role: null, userId: null, username: null, email: null, avatarUrl: null };
  }

  const { data: row } = await sb
    .from('users')
    .select('role, username, email, image, updated_at')
    .eq('id', user.id)
    .maybeSingle()
    .returns<UserSlim | null>();

  const email: string | null = row?.email ?? user.email ?? null;  
  const username: string | null = row?.username ?? null;

  // OAuth metadata fallback
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const metaAvatar =
    (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    null;

  // Public avatars bucket → public URL, ardından cache-buster
  const publicUrl = await resolveAvatarUrl(row?.image ?? metaAvatar);
  const avatarUrl = withVersion(publicUrl, row?.updated_at ?? null);

  const role = (row?.role ?? null) as 'Admin' | 'Manager' | 'User' | null;

  return { role, userId: user.id, username, email, avatarUrl };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const [{ role, userId, username, email, avatarUrl }, row, dicts, comments] = await Promise.all([
    getSessionInfo(),
    fetchProductById(id),
    fetchProductDicts(),
    fetchProductComments(id),
  ]);

  if (!row) notFound();

  const canEdit = role === 'Admin' || role === 'Manager';
  const canPin = role === 'Admin'; // ← EKLENDİ
  
  const product = mapRowToProduct(row);

  const { categoryLabelMap, subLabelMap } = buildCategoryHelpers(dicts.categoryTree);
  const variantLabelMap = Object.fromEntries(dicts.variants.map(v => [v.key, v.name] as const));

  // ---------- MEDYA SEÇİMİ + GÜVENLİ URL ----------
  const preferPdf = (product.fileExt ?? '').toLowerCase() === 'pdf' && !!product.filePath;
  const rawPrimary = preferPdf ? product.filePath : product.image;
  const rawSecondary = preferPdf ? product.image : product.filePath;

  function toSecureUrl(storageKey: string | null | undefined): string | null {
    if (!storageKey) return null;

    // Tam http(s) URL ise dokunma (ama tercih edilen değil)
    if (/^https?:\/\//i.test(storageKey)) return storageKey;

    // Eski kayıtlarda yanlışlıkla "product-media/..." prefiksi varsa, strip et.
    const key = storageKey.startsWith(PRODUCT_BUCKET + '/')
      ? storageKey.slice(PRODUCT_BUCKET.length + 1)
      : storageKey;

    return `/api/products/storage?bucket=${encodeURIComponent(PRODUCT_BUCKET)}&path=${encodeURIComponent(key)}`;
  }

  const basePrimary = toSecureUrl(rawPrimary);
  const baseSecondary = toSecureUrl(rawSecondary);

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
              variant={product.variant}
              category={product.category}
              subCategory={product.subCategory ?? undefined}
              date={product.date}
              revisionDate={product.revisionDate || ''}  // ← EKLE
              id={String(product.id)}
              drawer={product.drawer}
              control={product.control}
              scale={product.scale}
              outerSizeMm={product.outerSizeMm}
              sectionMm2={product.sectionMm2}
              unit_weight_g_pm={typeof product.unit_weight_g_pm === 'number' ? product.unit_weight_g_pm : undefined}
              has_customer_mold={row.has_customer_mold}
              availability={product.availability}
              hasCustomerMold={product.hasCustomerMold}
              tempCode={product.tempCode}
              profileCode={product.profileCode}
              manufacturerCode={product.manufacturerCode}
              labels={{
                category: Object.fromEntries(categoryLabelMap),
                subCategory: Object.fromEntries(subLabelMap),
                variant: variantLabelMap,
              }}
              mediaSrc={basePrimary}
              mediaFileUrl={baseSecondary}
              mediaExt={mediaExt}
              mediaMime={product.fileMime ?? null}
              description={product.description}
            >
              <ProductDetailActions id={String(product.id)} canEdit={canEdit} />
            </ProductInfo>

            <CommentSection
              productId={String(product.id)}
              currentUserId={userId}
              currentUserUsername={username}
              currentUserEmail={email}
              currentUserAvatarUrl={avatarUrl}
              initialComments={comments}
              canPin={canPin}              // ← EKLENDİ
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
