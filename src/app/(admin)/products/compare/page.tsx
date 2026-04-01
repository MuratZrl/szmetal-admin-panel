// app/(admin)/products/compare/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { redirect } from 'next/navigation';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

import { requirePageAccess } from '@/lib/supabase/auth/guards.server';
import { fetchProductByIdWithCategoryChain } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import { buildLabelMaps } from '@/features/products/services/labelMaps.server';
import { mapRowToProduct } from '@/features/products/types';

import type { Database } from '@/types/supabase';

import ComparisonTable from '@/features/products/components/compare/ComparisonTable.client';

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

type SP = Record<string, string | string[] | undefined>;
type PageProps = { searchParams: Promise<SP> };

export default async function CompareProductsPage({ searchParams: spPromise }: PageProps) {
  await requirePageAccess('/products');

  const sp = await spPromise;
  const idsRaw = Array.isArray(sp.ids) ? sp.ids[0] : sp.ids;
  const ids = (idsRaw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // En az 2, en fazla 4 ürün — yoksa boş durum göster
  if (ids.length < 2 || ids.length > 4) {
    return (
      <Box px={1} py={1}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <Button
            href="/products"
            variant="text"
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ textTransform: 'capitalize' }}
          >
            Ürünlere Dön
          </Button>

          <Typography
            component="h2"
            sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 22 }, lineHeight: 1.2 }}
          >
            Ürün Karşılaştırma
          </Typography>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 6, sm: 10 },
            px: 3,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <CompareArrowsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />

          <Typography variant="h6" fontWeight={600} mb={1}>
            Henüz ürün seçilmedi
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3} maxWidth={400}>
            Karşılaştırma yapmak için ürünler sayfasından 2-4 ürün seçin.
            Her ürün kartının sol üst köşesindeki seçim butonunu kullanabilirsiniz.
          </Typography>

          <Button
            href="/products"
            variant="contained"
            size="medium"
            disableElevation
            sx={{ textTransform: 'capitalize', px: 3 }}
          >
            Ürünleri Görüntüle
          </Button>
        </Paper>
      </Box>
    );
  }

  // Ürünleri + sözlükleri paralel fetch
  const [dicts, ...rows] = await Promise.all([
    fetchProductDicts(),
    ...ids.map((id) => fetchProductByIdWithCategoryChain(id)),
  ]);

  // null olanları filtrele
  const validRows = rows.filter(Boolean) as ProductsRowWithChain[];

  if (validRows.length < 2) {
    return (
      <Box px={1} py={1}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <Button
            href="/products"
            variant="text"
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ textTransform: 'capitalize' }}
          >
            Ürünlere Dön
          </Button>

          <Typography
            component="h2"
            sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 22 }, lineHeight: 1.2 }}
          >
            Ürün Karşılaştırma
          </Typography>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 6, sm: 10 },
            px: 3,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <CompareArrowsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />

          <Typography variant="h6" fontWeight={600} mb={1}>
            Ürünler bulunamadı
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3} maxWidth={400}>
            Seçilen ürünlerden bazıları bulunamadı veya silinmiş olabilir. Lütfen tekrar deneyin.
          </Typography>

          <Button
            href="/products"
            variant="contained"
            size="medium"
            disableElevation
            sx={{ textTransform: 'capitalize', px: 3 }}
          >
            Ürünleri Görüntüle
          </Button>
        </Paper>
      </Box>
    );
  }

  const products = validRows.map(enrichProductWithCategoryChain);
  const labelMaps = buildLabelMaps(dicts);

  // Medya URL'lerini çöz — API route üzerinden (PDF'leri de doğru gösterir)
  const mediaUrlsById: Record<string, string | null> = {};
  for (const p of products) {
    const versionKey = p.updatedAt ?? p.createdAt ?? null;
    const v = versionKey ? `&v=${encodeURIComponent(versionKey)}` : '';
    mediaUrlsById[p.id] = `/api/products/storage/${encodeURIComponent(p.id)}?slot=primary${v}`;
  }

  return (
    <Box px={1} py={1}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <Button
          href="/products"
          variant="text"
          size="small"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'capitalize' }}
        >
          Ürünlere Dön
        </Button>

        <Typography
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 18, sm: 22 },
            lineHeight: 1.2,
          }}
        >
          Ürün Karşılaştırma ({products.length})
        </Typography>
      </Stack>

      <ComparisonTable
        products={products}
        mediaUrlsById={mediaUrlsById}
        labels={labelMaps}
      />
    </Box>
  );
}
