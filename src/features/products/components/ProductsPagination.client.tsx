'use client';
// src/features/products/components/ProductsPagination.client.tsx

import * as React from 'react';
import CustomPagination from '@/components/ui/pagination/Pagination.client';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery.client';

type Props = { page: number; totalPages: number };

export default function ProductsPagination({ page, totalPages }: Props): React.JSX.Element {
  const { navigate } = useProductsQuery();

  const onChange = React.useCallback(
    (_e: React.ChangeEvent<unknown>, value: number) => {
      navigate({ page: value <= 1 ? null : String(value) });
    },
    [navigate]
  );

  return <CustomPagination page={page} totalPages={totalPages} onChange={onChange} />;
}
