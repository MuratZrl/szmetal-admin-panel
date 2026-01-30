'use client';
// src/features/products/components/ui/Filter/hooks/useProductFilters.ts

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { CategoryTree } from '../types';

export type MoldMode = 'all' | 'mold' | 'nonMold';
export type AvailabilityMode = 'all' | 'unavailable' | 'available';

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

  sort: string;
  setSort: React.Dispatch<React.SetStateAction<string>>;

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

function buildParentMap(tree: CategoryTree): Map<string, string> {
  const m = new Map<string, string>();
  for (const [parent, node] of Object.entries(tree)) {
    for (const sub of node.subs) m.set(sub.slug, parent);
  }
  return m;
}

function parseMoldMode(raw: string | null): MoldMode {
  if (!raw) return 'all';

  const v = raw.trim().toLocaleLowerCase('tr');

  // Eski/uyumlu değerler: "Evet", "true", "1"
  if (v === 'evet' || v === 'true' || v === '1' || v === 'mold') return 'mold';

  // Yeni değer: "Hayır" / "false" / "0"
  if (v === 'hayır' || v === 'hayir' || v === 'false' || v === '0' || v === 'nonmold') return 'nonMold';

  return 'all';
}

function parseAvailabilityMode(raw: string | null): AvailabilityMode {
  if (!raw) return 'all';

  const v = raw.trim().toLocaleLowerCase('tr');

  // Geriye dönük uyumluluk: senin projede "availability=0" => Kullanılamaz
  if (v === '0' || v === 'false' || v === 'unavailable' || v === 'kullanilamaz' || v === 'kullanılamaz') {
    return 'unavailable';
  }

  // Yeni: "availability=1" => Kullanılabilir
  if (v === '1' || v === 'true' || v === 'available' || v === 'kullanilabilir' || v === 'kullanılabilir') {
    return 'available';
  }

  return 'all';
}

export function useProductFilters(categoryTree: CategoryTree): UseProductFiltersResult {
  const router = useRouter();
  const sp = useSearchParams();

  const initialCategories = sp.getAll('category');
  const initialSubCategories = sp.getAll('subCategory');

  const rawQ = sp.get('q') ?? '';
  const rawCM = sp.get('customerMold');
  const rawAvail = sp.get('availability');
  const rawFrom = sp.get('from') ?? '';
  const rawTo = sp.get('to') ?? '';
  const rawSort = sp.get('sort') ?? 'date-desc';
  const rawVariants = sp.getAll('variants');

  const initialMoldMode = parseMoldMode(rawCM);
  const initialAvailabilityMode = parseAvailabilityMode(rawAvail);

  const [q, setQ] = React.useState<string>(rawQ);
  const [categories, setCategories] = React.useState<string[]>(initialCategories);
  const [subCategories, setSubCategories] = React.useState<string[]>(initialSubCategories);
  const [variantsSel, setVariantsSel] = React.useState<string[]>(rawVariants);
  const [from, setFrom] = React.useState<string>(rawFrom);
  const [to, setTo] = React.useState<string>(rawTo);
  const [sort, setSort] = React.useState<string>(rawSort);

  const [moldMode, setMoldMode] = React.useState<MoldMode>(initialMoldMode);
  const [availabilityMode, setAvailabilityMode] =
    React.useState<AvailabilityMode>(initialAvailabilityMode);

  const [variantQuery, setVariantQuery] = React.useState<string>('');

  const [expanded, setExpanded] = React.useState<string[]>(() => {
    const parentMap = buildParentMap(categoryTree);
    const s = new Set<string>(initialCategories);

    for (const sub of initialSubCategories) {
      let cur: string | undefined = sub;
      while (cur && parentMap.has(cur)) {
        const p = parentMap.get(cur);
        if (!p) break;
        s.add(p);
        cur = p;
      }
    }

    return Array.from(s);
  });

  const isFirstRender = React.useRef<boolean>(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (q.trim()) params.set('q', q.trim());
    categories.forEach((c) => params.append('category', c));
    subCategories.forEach((s) => params.append('subCategory', s));
    variantsSel.forEach((key) => params.append('variants', key));

    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (sort) params.set('sort', sort);

    // 3 durumlu müşteri kalıbı filtresi
    if (moldMode === 'mold') params.set('customerMold', 'Evet');
    if (moldMode === 'nonMold') params.set('customerMold', 'Hayır');
    // moldMode === 'all' => param yok => hepsi

    // 3 durumlu kullanılabilirlik filtresi
    if (availabilityMode === 'unavailable') params.set('availability', '0');
    if (availabilityMode === 'available') params.set('availability', '1');
    // availabilityMode === 'all' => param yok => hepsi

    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  }, [
    q,
    categories,
    subCategories,
    variantsSel,
    from,
    to,
    sort,
    moldMode,
    availabilityMode,
    router,
  ]);

  const reset = React.useCallback(() => {
    setQ('');
    setCategories([]);
    setSubCategories([]);
    setVariantsSel([]);
    setFrom('');
    setTo('');
    setSort('date-desc');

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
