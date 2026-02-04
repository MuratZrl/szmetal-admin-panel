// app/(admin)/products/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { Box, Grid, Divider } from '@mui/material';

import ProductsToolbar from '@/features/products/components/ProductsToolbar.client';
import Filters from '@/features/products/components/ui/Filter/Filters.client';
import ProductsGrid from '@/features/products/components/ProductsGrid.client';
import ProductsPagination from '@/features/products/components/ProductsPagination.client';

import { parseProductFilters } from '@/features/products/utils/parseProductFilters';
import { fetchFilteredProducts } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import { resolveStorageUrl } from '@/features/products/services/resolveStorageUrl.server';
import { withVersion } from '@/features/products/utils/url';

import { requirePageAccess } from '@/lib/supabase/auth/guards.server';

// BURASI YENİ: label map + breadcrumb üreten helper
import { buildLabelMaps } from '@/features/products/services/labelMaps.server';

const DEFAULT_PAGE_SIZE = 16;
const MAX_PAGE_SIZE = 48;

type SP = Record<string, string | string[] | undefined>;
type PageProps = { searchParams: Promise<SP> };

function toInt(
  input: string | string[] | undefined,
  fallback: number,
  clamp?: { min?: number; max?: number }
) {
  const raw = Array.isArray(input) ? input[0] : input;
  const n = Number(raw);
  let v = Number.isFinite(n) ? Math.floor(n) : fallback;
  if (clamp?.min !== undefined) v = Math.max(clamp.min, v);
  if (clamp?.max !== undefined) v = Math.min(clamp.max, v);
  return v;
}

export default async function ProductsPage({ searchParams: spPromise }: PageProps) {
  const { profile } = await requirePageAccess('/products');
  const role = profile.role ?? null;

  const sp = await spPromise;
  const page = toInt(sp.page, 1, { min: 1 });
  const pageSize = toInt(sp.pageSize, DEFAULT_PAGE_SIZE, { min: 1, max: MAX_PAGE_SIZE });
  const filters = parseProductFilters(sp);

  // Ürünler + sözlükleri paralel çek
  const [{ items, pageCount, total }, dicts] = await Promise.all([
    fetchFilteredProducts(filters, { page, pageSize }),
    fetchProductDicts(),
  ]);

  // LABEL MAP + BREADCRUMB: tüm iş burada
  const labelMaps = buildLabelMaps(dicts);

  const mediaUrlsByIdEntries = await Promise.all(
    items.map(async (p) => {
      const preferPdf = (p.fileExt ?? '').toLowerCase() === 'pdf' && !!p.filePath;
      const raw = preferPdf ? p.filePath : p.image;
      const signed = await resolveStorageUrl(raw);
      const withVer = withVersion(signed, p.updatedAt ?? p.createdAt ?? null);
      return [String(p.id), withVer] as const;
    }),
  );
  
  const mediaUrlsById: Record<string, string | null> = Object.fromEntries(mediaUrlsByIdEntries);

  const perms = {
    canCreate: role === 'Admin' || role === 'Manager',
  };

  return (
    <Box px={1} py={1}>
      <ProductsToolbar perms={perms} totalCount={total} />
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 2.75 }}>
          <Filters
            topLevelSlugs={dicts.categories}
            categoryTree={dicts.categoryTree}
            variants={dicts.variants}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 9.25 }}>
          <ProductsGrid
            products={items}
            mediaUrlsById={mediaUrlsById}
            role={role}
            labels={labelMaps}   // BURAYA ARTIK TAM LabelMaps GİDİYOR
          />
          <ProductsPagination page={page} totalPages={pageCount} />
        </Grid>
      </Grid>
    </Box>
  );
}
