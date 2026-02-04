'use client';
// src/components/ui/pagination/Pagination.tsx

import * as React from 'react';
import {
  useTheme,
  useMediaQuery,
  Box,
  Pagination,
  PaginationItem,
} from '@mui/material';
import type { PaginationRenderItemParams } from '@mui/material/Pagination';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function CustomPagination({ page, totalPages, onChange }: PaginationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // İSTEK: "1 2 3 ... last-1 last"
  // Bu formatın anlamlı olması için en az 6 sayfa olmalı.
  // (1,2,3, ..., last-1,last => last=6)
  const compactStart = totalPages > 5 && page <= 3;

  const siblingCount = isMobile ? 0 : compactStart ? 0 : 1;

  return (
    <Box display="flex" justifyContent="center" my={2}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={onChange}
        siblingCount={siblingCount}
        boundaryCount={2} // ✅ son iki sayfayı (last-1,last) sabitle
        showFirstButton={!isMobile}
        showLastButton={!isMobile}
        renderItem={(item: PaginationRenderItemParams) => {
          // İlk üç sayfadayken: 4..(last-2) arası sayfaları gizle.
          // last-1 ve last zaten boundaryCount=2 ile görünecek.
          if (
            compactStart &&
            item.type === 'page' &&
            item.page != null &&
            item.page > 3 &&
            item.page < totalPages - 1
          ) {
            return null;
          }

          return <PaginationItem {...item} />;
        }}
      />
    </Box>
  );
}
