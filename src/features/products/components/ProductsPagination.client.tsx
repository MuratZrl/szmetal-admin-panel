// src/features/products/components/ProductsPagination.client.tsx
'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CustomPagination from '@/components/ui/pagination/Pagination';

type Props = { page: number; totalPages: number; };

export default function ProductsPagination({ page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const onChange = React.useCallback(
    (_e: React.ChangeEvent<unknown>, value: number) => {
      const params = new URLSearchParams(sp);
      if (value <= 1) params.delete('page');
      else params.set('page', String(value));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, sp]
  );

  return <CustomPagination page={page} totalPages={totalPages} onChange={onChange} />;
}
