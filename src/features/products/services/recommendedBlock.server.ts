// src/features/products/services/recommendedBlock.server.ts
import { fetchRecommendedProducts } from '@/features/products/services/recommended.server';
import { resolveStorageUrl } from '@/features/products/services/resolveStorageUrl.server';
import { withVersion } from '@/features/products/utils/url';
import { mapRowToProduct, type Product } from '@/features/products/types';
import type { Tables } from '@/types/supabase';

type ProductRow = Tables<'products'>;

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

  const products = rows.map(mapRowToProduct);

  const entries = await Promise.all(
    products.map(async (p) => {
      const preferPdf = (p.fileExt ?? '').toLowerCase() === 'pdf' && !!p.filePath;
      const raw = preferPdf ? p.filePath : p.image;

      const signed = await resolveStorageUrl(raw);
      const ver = withVersion(signed, p.updatedAt ?? p.createdAt ?? null);

      return [String(p.id), ver] as const;
    }),
  );

  const mediaUrlsById: Record<string, string | null> = Object.fromEntries(entries);
  return { products, mediaUrlsById };
}
