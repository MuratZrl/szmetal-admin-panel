'use client';
// src/features/products/components/ui/Filter/hooks/useProductFilters.ts

import * as React from 'react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { CategoryTree } from '../types';

export type MoldMode = 'all' | 'mold' | 'nonMold';
export type AvailabilityMode = 'all' | 'unavailable' | 'available';

export type ProductSort =
  | 'date-desc'
  | 'date-asc'
  | 'weight-asc'
  | 'weight-desc'
  | 'code-asc'
  | 'code-desc';

export type UseProductFiltersResult = {
  q: string;
  setQ: React.Dispatch<React.SetStateAction<string>>;

  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;

  subCategories: string[];
  setSubCategories: React.Dispatch<React.SetStateAction<string[]>>;

  variantsSel: string[];
  setVariantsSel: React.Dispatch<React.SetStateAction<string[]>>;

  from: string;
  setFrom: React.Dispatch<React.SetStateAction<string>>;

  to: string;
  setTo: React.Dispatch<React.SetStateAction<string>>;

  sort: ProductSort;
  setSort: React.Dispatch<React.SetStateAction<ProductSort>>;

  moldMode: MoldMode;
  setMoldMode: React.Dispatch<React.SetStateAction<MoldMode>>;

  availabilityMode: AvailabilityMode;
  setAvailabilityMode: React.Dispatch<React.SetStateAction<AvailabilityMode>>;

  variantQuery: string;
  setVariantQuery: React.Dispatch<React.SetStateAction<string>>;

  expanded: string[];
  setExpanded: React.Dispatch<React.SetStateAction<string[]>>;

  reset: () => void;
};

const DEFAULT_SORT: ProductSort = 'date-desc';

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

function arraysEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function isValidDateParam(raw: string): boolean {
  if (!raw) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw);
}

function normalizeSort(raw: string | null): ProductSort {
  const v = (raw ?? '').trim();
  const allowed: readonly ProductSort[] = [
    'date-desc',
    'date-asc',
    'weight-asc',
    'weight-desc',
    'code-asc',
    'code-desc',
  ] as const;
  return (allowed as readonly string[]).includes(v) ? (v as ProductSort) : DEFAULT_SORT;
}

function buildParentMap(tree: CategoryTree): Map<string, string> {
  const m = new Map<string, string>();
  for (const [parent, node] of Object.entries(tree)) {
    for (const sub of node.subs) m.set(sub.slug, parent);
  }
  return m;
}

function deriveExpanded(categoryTree: CategoryTree, categories: string[], subCategories: string[]): string[] {
  const parentMap = buildParentMap(categoryTree);
  const s = new Set<string>(categories);

  for (const sub of subCategories) {
    let cur: string | undefined = sub;
    while (cur && parentMap.has(cur)) {
      const p = parentMap.get(cur);
      if (!p) break;
      s.add(p);
      cur = p;
    }
  }

  return Array.from(s);
}

function parseMoldMode(raw: string | null): MoldMode {
  if (!raw) return 'all';
  const v = raw.trim().toLocaleLowerCase('tr');

  if (v === 'evet' || v === 'true' || v === '1' || v === 'mold') return 'mold';
  if (
    v === 'hayır' ||
    v === 'hayir' ||
    v === 'false' ||
    v === '0' ||
    v === 'nonmold' ||
    v === 'non_mold' ||
    v === 'non-mold'
  ) {
    return 'nonMold';
  }

  return 'all';
}

function parseAvailabilityMode(raw: string | null): AvailabilityMode {
  if (!raw) return 'all';
  const v = raw.trim().toLocaleLowerCase('tr');

  if (v === '0' || v === 'false' || v === 'unavailable' || v === 'kullanilamaz' || v === 'kullanılamaz') {
    return 'unavailable';
  }

  if (v === '1' || v === 'true' || v === 'available' || v === 'kullanilabilir' || v === 'kullanılabilir') {
    return 'available';
  }

  return 'all';
}

type UrlSnapshot = {
  q: string;
  categories: string[];
  subCategories: string[];
  variantsSel: string[];
  from: string;
  to: string;
  sort: ProductSort;
  moldMode: MoldMode;
  availabilityMode: AvailabilityMode;
  pageSize: string;
};

// Next'in ReadonlyURLSearchParams tipine isimle bağımlı olmak yerine,
// useSearchParams'in dönüş tipini kullanıyoruz. Böylece “type bulunamadı” bitti.
type SearchParamsLike = ReturnType<typeof useSearchParams>;

function readFromSearchParams(sp: SearchParamsLike): UrlSnapshot {
  const q = (sp.get('q') ?? '').trim();
  const categories = uniqTrimmed(sp.getAll('category'));
  const subCategories = uniqTrimmed(sp.getAll('subCategory'));
  const variantsSel = uniqTrimmed(sp.getAll('variants'));

  const fromRaw = (sp.get('from') ?? '').trim();
  const toRaw = (sp.get('to') ?? '').trim();
  const from = isValidDateParam(fromRaw) ? fromRaw : '';
  const to = isValidDateParam(toRaw) ? toRaw : '';

  const sort = normalizeSort(sp.get('sort'));
  const moldMode = parseMoldMode(sp.get('customerMold'));
  const availabilityMode = parseAvailabilityMode(sp.get('availability'));

  const pageSize = (sp.get('pageSize') ?? '').trim();

  return { q, categories, subCategories, variantsSel, from, to, sort, moldMode, availabilityMode, pageSize };
}

function toSearchParams(snapshot: UrlSnapshot): URLSearchParams {
  const params = new URLSearchParams();

  if (snapshot.q) params.set('q', snapshot.q);
  snapshot.categories.forEach((c) => params.append('category', c));
  snapshot.subCategories.forEach((s) => params.append('subCategory', s));
  snapshot.variantsSel.forEach((k) => params.append('variants', k));

  if (snapshot.from) params.set('from', snapshot.from);
  if (snapshot.to) params.set('to', snapshot.to);

  if (snapshot.sort && snapshot.sort !== DEFAULT_SORT) params.set('sort', snapshot.sort);

  if (snapshot.moldMode === 'mold') params.set('customerMold', 'Evet');
  if (snapshot.moldMode === 'nonMold') params.set('customerMold', 'Hayır');

  if (snapshot.availabilityMode === 'unavailable') params.set('availability', '0');
  if (snapshot.availabilityMode === 'available') params.set('availability', '1');

  if (snapshot.pageSize) params.set('pageSize', snapshot.pageSize);

  return params;
}

export function useProductFilters(categoryTree: CategoryTree): UseProductFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const snap = React.useMemo(() => readFromSearchParams(sp), [sp]);

  const [q, setQ] = React.useState<string>(snap.q);
  const [categories, setCategories] = React.useState<string[]>(snap.categories);
  const [subCategories, setSubCategories] = React.useState<string[]>(snap.subCategories);
  const [variantsSel, setVariantsSel] = React.useState<string[]>(snap.variantsSel);
  const [from, setFrom] = React.useState<string>(snap.from);
  const [to, setTo] = React.useState<string>(snap.to);
  const [sort, setSort] = React.useState<ProductSort>(snap.sort);

  const [moldMode, setMoldMode] = React.useState<MoldMode>(snap.moldMode);
  const [availabilityMode, setAvailabilityMode] = React.useState<AvailabilityMode>(snap.availabilityMode);

  const [variantQuery, setVariantQuery] = React.useState<string>('');

  const [expanded, setExpanded] = React.useState<string[]>(() =>
    deriveExpanded(categoryTree, snap.categories, snap.subCategories),
  );

  const lastAppliedQsRef = React.useRef<string>('');

  React.useEffect(() => {
    const currentQs = sp.toString();
    if (currentQs === lastAppliedQsRef.current) return;

    const next = readFromSearchParams(sp);

    setQ((prev) => (prev !== next.q ? next.q : prev));
    setCategories((prev) => (arraysEqual(prev, next.categories) ? prev : next.categories));
    setSubCategories((prev) => (arraysEqual(prev, next.subCategories) ? prev : next.subCategories));
    setVariantsSel((prev) => (arraysEqual(prev, next.variantsSel) ? prev : next.variantsSel));

    setFrom((prev) => (prev !== next.from ? next.from : prev));
    setTo((prev) => (prev !== next.to ? next.to : prev));
    setSort((prev) => (prev !== next.sort ? next.sort : prev));

    setMoldMode((prev) => (prev !== next.moldMode ? next.moldMode : prev));
    setAvailabilityMode((prev) => (prev !== next.availabilityMode ? next.availabilityMode : prev));

    setExpanded((prev) => {
      const derived = deriveExpanded(categoryTree, next.categories, next.subCategories);
      return arraysEqual(prev, derived) ? prev : derived;
    });
  }, [sp, categoryTree]);

  const firstRenderRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const snapshot: UrlSnapshot = {
      q: q.trim(),
      categories: uniqTrimmed(categories),
      subCategories: uniqTrimmed(subCategories),
      variantsSel: uniqTrimmed(variantsSel),
      from: isValidDateParam(from) ? from : '',
      to: isValidDateParam(to) ? to : '',
      sort,
      moldMode,
      availabilityMode,
      pageSize: (sp.get('pageSize') ?? '').trim(),
    };

    const nextParams = toSearchParams(snapshot);
    const nextQs = nextParams.toString();
    const currentQs = sp.toString();

    if (nextQs === currentQs) return;

    lastAppliedQsRef.current = nextQs;

    const href = (nextQs ? `${pathname}?${nextQs}` : pathname) as Route;
    router.replace(href, { scroll: false });
  }, [q, categories, subCategories, variantsSel, from, to, sort, moldMode, availabilityMode, router, pathname, sp]);

  const reset = React.useCallback(() => {
    setQ('');
    setCategories([]);
    setSubCategories([]);
    setVariantsSel([]);
    setFrom('');
    setTo('');
    setSort(DEFAULT_SORT);

    setMoldMode('all');
    setAvailabilityMode('all');

    setVariantQuery('');
    setExpanded([]);
  }, []);

  return {
    q,
    setQ,
    categories,
    setCategories,
    subCategories,
    setSubCategories,
    variantsSel,
    setVariantsSel,
    from,
    setFrom,
    to,
    setTo,
    sort,
    setSort,
    moldMode,
    setMoldMode,
    availabilityMode,
    setAvailabilityMode,
    variantQuery,
    setVariantQuery,
    expanded,
    setExpanded,
    reset,
  };
}
