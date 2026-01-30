'use client';
// src/features/products/components/ProductsPagination.client.tsx

import * as React from 'react';

import type { Route } from 'next'; // ⬅️ önemli
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import CustomPagination from '@/components/ui/pagination/Pagination';

type Props = { page: number; totalPages: number };

export default function ProductsPagination({ page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const onChange = React.useCallback(
    (_e: React.ChangeEvent<unknown>, value: number) => {
      const params = new URLSearchParams(sp); // ReadonlyURLSearchParams → kopya
      if (value <= 1) params.delete('page');
      else params.set('page', String(value));

      const query = params.toString();
      const href = (query ? `${pathname}?${query}` : pathname) as Route; // ⬅️ assert

      router.push(href, { scroll: false });
    },
    [router, pathname, sp]
  );

  return <CustomPagination page={page} totalPages={totalPages} onChange={onChange} />;
}
