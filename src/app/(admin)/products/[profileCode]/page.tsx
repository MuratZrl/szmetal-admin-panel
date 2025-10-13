// app/(admin)/products/[profileCode]/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Box, Grid, Stack } from '@mui/material';

import { requirePageAccess } from '@/lib/supabase/auth/server';
import { createSupabaseRSCClient } from '@/lib/supabase/supabaseServer';

import { fetchProductByKey } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import { fetchProductComments } from '@/features/products/comments/services/fetchComments.server';

import { withVersion, productCanonicalPath } from '@/features/products/utils/url'; // ← EKLENDİ
import { resolveAvatarUrl } from '@/features/products/comments/services/resolveAvatarUrl.server';

import { mapRowToProduct } from '@/features/products/types';
import { buildCategoryHelpers } from '@/features/products/forms/helpers';

import ProductMedia from '@/features/products/components/ProductMedia';
import ProductInfo from '@/features/products/components/ProductInfo';
import ProductDetailActions from '@/features/products/components/ProductDetailActions';
import CommentSection from '@/features/products/components/CommentSection.client';

import type { Tables, Database } from '@/types/supabase';
type ProductsRow = Database['public']['Tables']['products']['Row']; // ← tip rahatlığı

const PRODUCT_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? 'product-media';

type Props = { params: Promise<{ profileCode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requirePageAccess('products');
  const { profileCode } = await params;
  const row = await fetchProductByKey(profileCode);
  if (!row) return { title: 'Ürün bulunamadı' };
  const p = mapRowToProduct(row);
  const leaf = p.profileCode || p.code || `#${p.id}`;
  return { title: `${leaf} — ${p.name}` };
}

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
  if (!user) redirect('/login');

  const { data: row } = await sb
    .from('users')
    .select('role, username, email, image, updated_at')
    .eq('id', user.id)
    .maybeSingle()
    .returns<UserSlim | null>();

  const email: string | null = row?.email ?? user.email ?? null;
  const username: string | null = row?.username ?? null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const metaAvatar =
    (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    null;

  const publicUrl = await resolveAvatarUrl(row?.image ?? metaAvatar);
  const avatarUrl = withVersion(publicUrl, row?.updated_at ?? null);

  const role = (row?.role ?? null) as 'Admin' | 'Manager' | 'User' | null;

  return { role, userId: user.id, username, email, avatarUrl };
}

export default async function ProductDetailPage({ params }: Props) {
  const { profile } = await requirePageAccess('products');
  const { profileCode } = await params;

  const [{ userId, username, email, avatarUrl }, row, dicts] = await Promise.all([
    getSessionInfo(),
    fetchProductByKey(profileCode),
    fetchProductDicts(),
  ]);

  if (!row) notFound();

  // ←←← KANONİK ZORLAMA: /products/{profileCode} değilse redirect
  const canonical = productCanonicalPath(row as ProductsRow);
  if (`/products/${profileCode}` !== canonical) {
    redirect(canonical);
  }

  const canEdit = profile.role === 'Admin' || profile.role === 'Manager';
  const canPin = profile.role === 'Admin';

  const product = mapRowToProduct(row);

  const { categoryLabelMap, subLabelMap } = buildCategoryHelpers(dicts.categoryTree);
  const variantLabelMap = Object.fromEntries(dicts.variants.map(v => [v.key, v.name] as const));

  const preferPdf = (product.fileExt ?? '').toLowerCase() === 'pdf' && !!product.filePath;
  const rawPrimary = preferPdf ? product.filePath : product.image;
  const rawSecondary = preferPdf ? product.image : product.filePath;

  function toSecureUrl(storageKey: string | null | undefined): string | null {
    if (!storageKey) return null;
    if (/^https?:\/\//i.test(storageKey)) return storageKey;
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

  const comments = await fetchProductComments(String(product.id));

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
              revisionDate={product.revisionDate || ''}
              id={String(product.id)}
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
              
              {/* ←←← ARTIK profileCode ve code’u geçiriyoruz */}
              <ProductDetailActions
                id={String(product.id)}
                canEdit={canEdit}
                profileCode={product.profileCode}
                code={product.code}
              />

            </ProductInfo>

            <CommentSection
              productId={String(product.id)}
              currentUserId={userId}
              currentUserUsername={username}
              currentUserEmail={email}
              currentUserAvatarUrl={avatarUrl}
              initialComments={comments}
              canPin={canPin}
            />
            
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
