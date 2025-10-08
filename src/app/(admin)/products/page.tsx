// app/(admin)/products/page.tsx
import { Box, Grid, Divider } from '@mui/material';
import { requirePageAccess } from '@/lib/supabase/auth/server';

import { ProductsSelectionProvider } from '@/features/products/selection/ProductsSelectionContext.client';
import ProductsToolbar from '@/features/products/components/ProductsToolbar.client';
import Filters from '@/features/products/components/Filter.client';
import ProductsGrid from '@/features/products/components/ProductsGrid.client';
import ProductsPagination from '@/features/products/components/ProductsPagination.client';

import { parseProductFilters } from '@/features/products/utils/parseProductFilters';
import { fetchFilteredProducts } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';

import { resolveStorageUrl } from '@/features/products/services/resolveStorageUrl.server';
import { withVersion } from '@/features/products/utils/url';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

type SP = Record<string, string | string[] | undefined>;
type PageProps = { searchParams: Promise<SP> };

function toInt(input: string | string[] | undefined, fallback: number, clamp?: { min?: number; max?: number }) {
  const raw = Array.isArray(input) ? input[0] : input;
  const n = Number(raw);
  let v = Number.isFinite(n) ? Math.floor(n) : fallback;
  if (clamp?.min !== undefined) v = Math.max(clamp.min, v);
  if (clamp?.max !== undefined) v = Math.min(clamp.max, v);
  return v;
}

export default async function ProductsPage({ searchParams: spPromise }: PageProps) {
  const { profile } = await requirePageAccess('products');

  const sp = await spPromise;
  const page = toInt(sp.page, 1, { min: 1 });
  const pageSize = toInt(sp.pageSize, DEFAULT_PAGE_SIZE, { min: 1, max: MAX_PAGE_SIZE });
  const filters = parseProductFilters(sp);

  const [{ items, pageCount }, dicts] = await Promise.all([
    fetchFilteredProducts(filters, { page, pageSize }),
    fetchProductDicts(),
  ]);

  // Kartta gösterilecek medya: PDF varsa onu, yoksa image.
  // Her iki durumda da path → signed URL; mutlak URL ise aynen (veya public'ten private'a çevireceksek util zaten imzalıyor).
  const mediaUrlsByIdEntries = await Promise.all(
    items.map(async (p) => {
      const preferPdf = (p.fileExt ?? '').toLowerCase() === 'pdf' && !!p.filePath;
      const raw = preferPdf ? p.filePath : p.image;  // ikisi de string | null
      const signed = await resolveStorageUrl(raw);
      const withVer = withVersion(signed, p.updatedAt ?? p.createdAt ?? null);
      return [String(p.id), withVer] as const;
    })
  );
  const mediaUrlsById: Record<string, string | null> = Object.fromEntries(mediaUrlsByIdEntries);

  const perms = {
    canCreate: profile?.role === 'Admin' || profile?.role === 'Manager',
    canBulkDelete: profile?.role === 'Admin',
  };

  return (
    <Box px={1} py={1}>
      <ProductsSelectionProvider>
        <ProductsToolbar perms={perms} />
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Filters categoryTree={dicts.categoryTree} variants={dicts.variants} />
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <ProductsGrid
              products={items}
              mediaUrlsById={mediaUrlsById}
              role={profile?.role ?? null}
            />
            <ProductsPagination page={page} totalPages={pageCount} />
          </Grid>
        </Grid>
      </ProductsSelectionProvider>
    </Box>
  );
}
