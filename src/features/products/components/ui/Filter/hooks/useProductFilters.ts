// src/features/products/components/ui/Filter/hooks/useProductFilters.ts
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { CategoryTree } from '../types';

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

  moldOnly: boolean;
  setMoldOnly: React.Dispatch<React.SetStateAction<boolean>>;

  availableOnly: boolean;
  setAvailableOnly: React.Dispatch<React.SetStateAction<boolean>>;

  variantQuery: string;
  setVariantQuery: React.Dispatch<React.SetStateAction<string>>;

  expanded: string[];
  setExpanded: React.Dispatch<React.SetStateAction<string[]>>;

  reset: () => void;
};

function buildParentMap(tree: CategoryTree): Map<string, string> {
  const m = new Map<string, string>();
  for (const [parent, node] of Object.entries(tree)) {
    for (const sub of node.subs) {
      m.set(sub.slug, parent);
    }
  }
  return m;
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

  const initialMold = rawCM === 'Evet' || rawCM === 'true' || rawCM === '1';
  const initialAvail = rawAvail === '0';

  const [q, setQ] = React.useState<string>(rawQ);
  const [categories, setCategories] = React.useState<string[]>(initialCategories);
  const [subCategories, setSubCategories] = React.useState<string[]>(initialSubCategories);
  const [variantsSel, setVariantsSel] = React.useState<string[]>(rawVariants);
  const [from, setFrom] = React.useState<string>(rawFrom);
  const [to, setTo] = React.useState<string>(rawTo);
  const [sort, setSort] = React.useState<string>(rawSort);
  const [moldOnly, setMoldOnly] = React.useState<boolean>(initialMold);
  const [availableOnly, setAvailableOnly] = React.useState<boolean>(initialAvail);
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

    if (moldOnly) params.append('customerMold', 'Evet');
    if (availableOnly) params.set('availability', '0');

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
    moldOnly,
    availableOnly,
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
    setMoldOnly(false);
    setAvailableOnly(false);
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
    moldOnly,
    setMoldOnly,
    availableOnly,
    setAvailableOnly,
    variantQuery,
    setVariantQuery,
    expanded,
    setExpanded,
    reset,
  };
}
