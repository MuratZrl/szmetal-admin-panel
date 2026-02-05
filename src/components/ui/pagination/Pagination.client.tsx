'use client';
// src/components/ui/pagination/Pagination.client.tsx

import * as React from 'react';
import { Box, Pagination, PaginationItem, useMediaQuery, useTheme } from '@mui/material';
import type { PaginationRenderItemParams } from '@mui/material/Pagination';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function CustomPagination({ page, totalPages, onChange }: PaginationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const last = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), last);

  // Küçük sayılarda zaten hepsini göstermek daha mantıklı
  const showAll = last <= 5;

  // İstenen set: 1, 2, current, last
  // (current = 1 veya 2 ise zaten duplike olacak, sorun yok)
  const keepPage = (p: number) => p === 1  || p === current || p === last;

  return (
    <Box display="flex" justifyContent="center" my={2}>
      <Pagination
        count={last}
        page={current}
        onChange={onChange}
        // MUI'nin ellipsis üretmesini istiyoruz, ama sayıları biz budayacağız.
        boundaryCount={2}
        siblingCount={0}
        showFirstButton={!isMobile}
        showLastButton={!isMobile}
        renderItem={(item: PaginationRenderItemParams) => {
          if (showAll) return <PaginationItem {...item} />;

          // Sayfa butonlarını filtrele (3,4,5,6,7 gibi fazlalıkları sakla)
          if (item.type === 'page' && item.page != null && !keepPage(item.page)) {
            return null;
          }

          // Ellipsis / prev-next / first-last aynen kalsın
          return <PaginationItem {...item} />;
        }}
      />
    </Box>
  );
}
