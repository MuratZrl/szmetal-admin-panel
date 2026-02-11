// src/features/products/utils/parseProductFilters.ts

import type { ProductFilters, ProductSort, CustomerMoldValue } from '@/features/products/types';

type RawParams = Record<string, string | string[] | undefined>;

function uniqTrimmed(arr: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of arr) {
    const v = raw.trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function toArray(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return uniqTrimmed(input);
  const t = input.trim();
  return t ? [t] : [];
}

function first(input: string | string[] | undefined): string {
  if (!input) return '';
  return (Array.isArray(input) ? input[0] : input).trim();
}

function isValidDateParam(raw: string): boolean {
  if (!raw) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw);
}

/**
 * URL'den gelen sort string'ini union tipe zorlar.
 * Geçersiz veya hiç gelmeyen durumda undefined döndürür.
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
  const v = raw.trim() as ProductSort;
  return allowed.includes(v) ? v : undefined;
}

function parseCustomerMold(raw: string): CustomerMoldValue[] | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLocaleLowerCase('tr');

  if (v === 'evet' || v === 'true' || v === '1' || v === 'mold') return ['Evet'];
  if (
    v === 'hayır' ||
    v === 'hayir' ||
    v === 'false' ||
    v === '0' ||
    v === 'nonmold' ||
    v === 'non_mold' ||
    v === 'non-mold'
  ) {
    return ['Hayır'];
  }

  return undefined;
}

function parseAvailability(raw: string): boolean | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLocaleLowerCase('tr');

  // availability=0 => Kullanılamaz
  if (v === '0' || v === 'false' || v === 'unavailable' || v === 'kullanilamaz' || v === 'kullanılamaz') return false;

  // availability=1 => Kullanılabilir
  if (v === '1' || v === 'true' || v === 'available' || v === 'kullanilabilir' || v === 'kullanılabilir') return true;

  return undefined;
}

export function parseProductFilters(sp: RawParams): ProductFilters {
  const q = first(sp.q);
  const fromRaw = first(sp.from);
  const toRaw = first(sp.to);

  const from = isValidDateParam(fromRaw) ? fromRaw : '';
  const to = isValidDateParam(toRaw) ? toRaw : '';

  const categories = toArray(sp.category);
  const subCategories = toArray(sp.subCategory);
  const variants = toArray(sp.variants);

  const sort = normalizeSort(first(sp.sort) || undefined);

  const customerMold = parseCustomerMold(first(sp.customerMold));
  const availability = parseAvailability(first(sp.availability));

  return {
    q: q || undefined,
    from: from || undefined,
    to: to || undefined,
    categories: categories.length ? categories : undefined,
    subCategories: subCategories.length ? subCategories : undefined,
    variants: variants.length ? variants : undefined,
    sort,
    customerMold,
    availability,
  };
}
