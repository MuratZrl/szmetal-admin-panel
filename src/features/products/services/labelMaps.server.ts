// src/features/products/services/labelMaps.server.ts
import 'server-only';

import type { ProductDicts } from '@/features/products/services/dicts.server';

/**
 * LabelMaps:
 *   - category: root vs child ayrımını umursamadan slug -> label
 *   - subcategory: eski kodla uyum için bırakılmış; aynı label’ı kullanabilir
 *   - subSubCategory: yeni UI alanı için; pratikte slug -> label (category ile aynı kapsam)
 *   - variant: varyant key -> label
 *   - categoryPathBySlug: slug -> ['Root', 'Alt', 'Leaf'] gibi breadcrumb path
 */
export type LabelMaps = {
  category: Record<string, string>;
  subcategory: Record<string, string>;
  subSubCategory: Record<string, string>;
  variant: Record<string, string>;
  categoryPathBySlug: Record<string, string[]>;
};

/**
 * buildLabelMaps:
 *   ProductDicts içindeki categoryTree + variants kullanılarak
 *   label map’leri ve breadcrumb path’ler üretilir.
 */
export function buildLabelMaps(dicts: ProductDicts): LabelMaps {
  const category: Record<string, string> = {};
  const subcategory: Record<string, string> = {};
  const subSubCategory: Record<string, string> = {};
  const variant: Record<string, string> = {};
  const categoryPathBySlug: Record<string, string[]> = {};

  const tree = dicts.categoryTree ?? {};

  // childSlug -> parentSlug | null
  const parentBySlug = new Map<string, string | null>();

  // Her node kendi adını ve çocuklarını label map’lere yaz
  for (const [slug, node] of Object.entries(tree)) {
    category[slug] = node.name;
    subcategory[slug] = node.name;
    subSubCategory[slug] = node.name;

    for (const sub of node.subs) {
      parentBySlug.set(sub.slug, slug);
      category[sub.slug] = sub.name;
      subcategory[sub.slug] = sub.name;
      subSubCategory[sub.slug] = sub.name;
    }

    // root gibi davranan node’lar için parent yok
    if (!parentBySlug.has(slug)) {
      parentBySlug.set(slug, null);
    }
  }

  const cache = new Map<string, string[]>();

  const getPath = (slug: string): string[] => {
    const cached = cache.get(slug);
    if (cached) return cached;

    const label = category[slug] ?? slug;
    const parentSlug = parentBySlug.get(slug) ?? null;

    if (!parentSlug) {
      const path = [label];
      cache.set(slug, path);
      return path;
    }

    const parentPath = getPath(parentSlug);
    const path = [...parentPath, label];
    cache.set(slug, path);
    return path;
  };

  // TÜM slug’lar için path üret
  for (const slug of parentBySlug.keys()) {
    categoryPathBySlug[slug] = getPath(slug);
  }

  // Varyant label map
  for (const v of dicts.variants ?? []) {
    variant[v.key] = v.name;
  }

  return {
    category,
    subcategory,
    subSubCategory,
    variant,
    categoryPathBySlug,
  };
}
