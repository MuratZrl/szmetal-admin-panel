// src/features/products/utils/parseProductFilters.ts

import type { ProductFilters, ProductSort, CustomerMoldValue } from '@/features/products/types';

type RawParams = Record<string, string | string[] | undefined>;

function toArray(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((v) => v.trim()).filter(Boolean);
  const t = input.trim();
  return t ? [t] : [];
}

function first(input: string | string[] | undefined): string {
  if (!input) return '';
  return (Array.isArray(input) ? input[0] : input).trim();
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
  const val = raw as ProductSort;
  return allowed.includes(val) ? val : undefined;
}

function parseCustomerMold(raw: string): CustomerMoldValue[] | undefined {
  if (!raw) return undefined;
  const v = raw.toLocaleLowerCase('tr');

  if (v === 'evet' || v === 'true' || v === '1' || v === 'mold') return ['Evet'];
  if (v === 'hayır' || v === 'hayir' || v === 'false' || v === '0' || v === 'nonmold' || v === 'non_mold')
    return ['Hayır'];

  return undefined;
}

function parseAvailability(raw: string): boolean | undefined {
  if (!raw) return undefined;
  const v = raw.toLocaleLowerCase('tr');

  // Senin eski mantık: availability=0 => Kullanılamaz
  if (v === '0' || v === 'false' || v === 'unavailable') return false;

  // Yeni toggle ile bunu da destekle (availability=1 => Kullanılabilir)
  if (v === '1' || v === 'true' || v === 'available') return true;

  return undefined;
}

export function parseProductFilters(sp: RawParams): ProductFilters {
  const q = first(sp.q);
  const from = first(sp.from);
  const to = first(sp.to);

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
