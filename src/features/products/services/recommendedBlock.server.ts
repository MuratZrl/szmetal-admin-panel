// src/features/products/services/recommendedBlock.server.ts
import 'server-only';
import { createSupabaseRSCClient } from '@/lib/supabase/supabaseServer';
import { createSupabaseAdminClient } from '@/lib/supabase/supabaseAdmin';
import { fetchRecommendedProducts } from '@/features/products/services/recommended.server';
import { withVersion } from '@/features/products/utils/url';
import { mapRowToProduct, type Product } from '@/features/products/types';
import type { Tables } from '@/types/supabase';

type ProductRow = Tables<'products'>;
type CategoryRow = Tables<'categories'>;

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || 'product-media';
const EXPIRES = 60 * 60; // 1 hour

export type RecommendedBlock = {
  products: Product[];
  mediaUrlsById: Record<string, string | null>;
};

export async function buildRecommendedBlock(args: {
  currentRow: ProductRow;
  limit?: number;
}): Promise<RecommendedBlock> {
  const limit = Math.max(1, Math.min(args.limit ?? 4, 12));

  const rows = await fetchRecommendedProducts({
    currentProductId: args.currentRow.id,
    categoryId: args.currentRow.category_id ?? null,
    variant: args.currentRow.variant ?? null,
    limit,
  });

  // Fetch category slugs
  const categoryIds = Array.from(
    new Set(
      rows
        .map((r) => r.category_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

  const slugByCategoryId = new Map<string, string>();
  if (categoryIds.length > 0) {
    const sb = await createSupabaseRSCClient();
    const { data, error } = await sb
      .from('categories')
      .select('id, slug')
      .in('id', categoryIds)
      .returns<Pick<CategoryRow, 'id' | 'slug'>[]>();
    if (error) throw error;
    for (const c of data ?? []) {
      const slug = (c.slug ?? '').trim();
      if (slug) slugByCategoryId.set(String(c.id), slug);
    }
  }

  // Build products with leaf slug
  const products: Product[] = rows.map((r) => {
    const base = mapRowToProduct(r);
    const cid = typeof r.category_id === 'string' ? r.category_id : '';
    const leafSlug = slugByCategoryId.get(cid) ?? null;
    if (!leafSlug) return base;
    return {
      ...base,
      subCategory: leafSlug,
      category: base.category ?? leafSlug,
      subSubCategory: base.subSubCategory ?? null,
    };
  });

  // Batch resolve all storage URLs in a SINGLE call instead of N individual calls
  const pathEntries: { id: string; path: string | null; version: string | null }[] = products.map(
    (p) => {
      const preferPdf = (p.fileExt ?? '').toLowerCase() === 'pdf' && !!p.filePath;
      const raw = preferPdf ? p.filePath : p.image;
      return {
        id: String(p.id),
        path: raw ?? null,
        version: p.updatedAt ?? p.createdAt ?? null,
      };
    },
  );

  const mediaUrlsById: Record<string, string | null> = {};

  // Separate paths that need signing vs absolute URLs
  const toSign: { id: string; path: string; version: string | null }[] = [];
  const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

  for (const entry of pathEntries) {
    if (!entry.path) {
      mediaUrlsById[entry.id] = null;
      continue;
    }

    // If it's an external non-Supabase URL, keep as-is
    if (/^https?:\/\//i.test(entry.path) && !entry.path.includes(BASE)) {
      mediaUrlsById[entry.id] = withVersion(entry.path, entry.version);
      continue;
    }

    // Strip Supabase URL prefix if present to get raw path
    let cleanPath = entry.path;
    if (/^https?:\/\//i.test(cleanPath)) {
      try {
        const url = new URL(cleanPath);
        const idx = url.pathname.indexOf('/object/');
        if (idx !== -1) {
          const after = url.pathname.slice(idx + '/object/'.length);
          const parts = after.split('/').filter(Boolean);
          if (parts.length >= 2) {
            cleanPath = decodeURIComponent(parts.slice(2).join('/'));
          }
        }
      } catch {
        mediaUrlsById[entry.id] = null;
        continue;
      }
    }

    toSign.push({ id: entry.id, path: cleanPath, version: entry.version });
  }

  // Single batch call to sign all URLs at once
  if (toSign.length > 0) {
    const admin = createSupabaseAdminClient();
    const paths = toSign.map((e) => e.path);

    const { data, error } = await admin.storage
      .from(BUCKET)
      .createSignedUrls(paths, EXPIRES);

    if (error || !data) {
      // Fallback: all null
      for (const entry of toSign) {
        mediaUrlsById[entry.id] = null;
      }
    } else {
      for (let i = 0; i < toSign.length; i++) {
        const entry = toSign[i]!;
        const signed = data[i]?.signedUrl ?? null;
        mediaUrlsById[entry.id] = withVersion(signed, entry.version);
      }
    }
  }

  return { products, mediaUrlsById };
}