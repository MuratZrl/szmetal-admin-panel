// src/features/products/utils/parseProductFilters.ts

import type { ProductFilters, ProductSort } from '@/features/products/types';

type RawParams = Record<string, string | string[] | undefined>;

function toArray(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((v) => v.trim()).filter((v) => v.length > 0);
  }
  const trimmed = input.trim();
  return trimmed.length > 0 ? [trimmed] : [];
}

function toBoolParam(value: string | string[] | undefined): boolean {
  if (!value) return false;
  const raw = Array.isArray(value) ? value[0] : value;
  const lowered = raw.toLowerCase();
  return ['1', 'true', 'on', 'yes', 'evet'].includes(lowered);
}

/**
 * URL'den gelen sort string'ini union tipe zorlar.
 * Geçersiz veya hiç gelmeyen durumda artık DEFAULT DÖNDÜRMÜYOR,
 * undefined döndürüyor. Böylece fetchFilteredProducts içindeki
 * switch/default bloğu çalışıp created_at DESC sıralaması devreye giriyor.
 */
function normalizeSort(raw: string | undefined): ProductSort | undefined {
  const allowed: ProductSort[] = [
    'date-desc',
    'date-asc',
    'weight-asc',
    'weight-desc',
    'code-asc',
    'code-desc',
  ];

  if (!raw) return undefined;

  const val = raw as ProductSort;
  return allowed.includes(val) ? val : undefined;
}

export function parseProductFilters(sp: RawParams): ProductFilters {
  const q = typeof sp.q === 'string' ? sp.q : '';

  const from = typeof sp.from === 'string' ? sp.from : '';
  const to = typeof sp.to === 'string' ? sp.to : '';

  const categories = toArray(sp.category);
  const subCategories = toArray(sp.subCategory);
  const variants = toArray(sp.variants);

  const rawSort = typeof sp.sort === 'string' ? sp.sort : undefined;
  const sort = normalizeSort(rawSort);

  let availability: boolean | undefined = undefined;

  const rawAvail = sp.availability;
  const rawAvailStr =
    typeof rawAvail === 'string'
      ? rawAvail.trim()
      : Array.isArray(rawAvail) && rawAvail[0]
      ? rawAvail[0].trim()
      : '';

  if (rawAvailStr === '0') {
    availability = false;
  }
  // İleride availability=1 için true da ekleyebilirsin.

  const moldOn = toBoolParam(sp.customerMold);

  const base: ProductFilters = {
    q,
    from,
    to,
    categories,
    subCategories,
    variants,
    sort,
    availability,
  };

  if (moldOn) {
    (base as unknown as { customerMold?: boolean }).customerMold = true;
  }

  return base;
}
