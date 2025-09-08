'use client';

import { useTheme, useMediaQuery, Box, Pagination } from '@mui/material';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function CustomPagination({ page, totalPages, onChange }: PaginationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box display="flex" justifyContent="center" my={2} >
      <Pagination
        count={totalPages}
        page={page}
        onChange={onChange}
        // shape / first-last temadan geliyor
        // ölçüler temadaki breakpoints ile çözülüyor
        siblingCount={isMobile ? 0 : 1}
        boundaryCount={isMobile ? 1 : 2}
      />
    </Box>
  );
}
