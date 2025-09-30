// src/features/products/utils/labelMaps.server.ts
import type { ProductDicts } from '@/features/products/services/dicts.server';

export type LabelMaps = {
  variant: Record<string, string>;
  category: Record<string, string>;
  subcategory: Record<string, string>;
};

export function buildLabelMaps(dicts: ProductDicts): LabelMaps {
  const variant = Object.fromEntries(dicts.variants.map(v => [v.key, v.name]));
  const category = Object.fromEntries(
    Object.entries(dicts.categoryTree).map(([slug, node]) => [slug, node.name])
  );
  const subcategory = Object.fromEntries(
    Object.values(dicts.categoryTree).flatMap(node => node.subs.map(s => [s.slug, s.name]))
  );

  return { variant, category, subcategory };
}
