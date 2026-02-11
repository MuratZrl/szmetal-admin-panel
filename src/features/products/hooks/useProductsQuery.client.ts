'use client';
// src/features/products/hooks/useProductsQuery.client.ts

import * as React from 'react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Patch = Record<string, string | null | undefined>;

export function useProductsQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const navigate = React.useCallback(
    (patch: Patch, opts?: { resetPage?: boolean; replace?: boolean }) => {
      const params = new URLSearchParams(sp.toString());

      for (const [key, val] of Object.entries(patch)) {
        if (val == null || val === '') params.delete(key);
        else params.set(key, val);
      }

      // Sadece filtre değişince sayfayı sıfırla
      if (opts?.resetPage) params.delete('page');

      const query = params.toString();
      const href = (query ? `${pathname}?${query}` : pathname) as Route;

      if (opts?.replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [router, pathname, sp]
  );

  return { navigate };
}
