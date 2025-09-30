// src/features/products/utils/parseProductFilters.ts
import type { ProductFilters } from "@/features/products/types";

const arr = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v : v ? [v] : [];

// YENİ: 'availability' için truthy kontrol
const truthy = (v: string | string[] | undefined): boolean | undefined => {
  const s = Array.isArray(v) ? v[0] : v;
  if (s == null) return undefined;
  return ['1', 'true', 'on', 'yes', 'evet'].includes(s.toLowerCase()) ? true : undefined;
};

export function parseProductFilters(sp: Record<string, string | string[] | undefined>): ProductFilters {
  return {
    q: typeof sp.q === 'string' ? sp.q : undefined,
    categories: arr(sp.category),
    subCategories: arr(sp.subCategory),
    variants: arr(sp.variants),
    from: typeof sp.from === 'string' ? sp.from : undefined,
    to: typeof sp.to === 'string' ? sp.to : undefined,
    sort: typeof sp.sort === 'string' ? (sp.sort as ProductFilters['sort']) : undefined,
    customerMold: arr(sp.customerMold) as ('Evet' | 'Hayır')[],
    availability: truthy(sp.availability),
  };
}
