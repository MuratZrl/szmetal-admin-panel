'use client';

import { Box, Pagination } from '@mui/material';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function CustomPagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <Box display="flex" justifyContent="center" mt={3}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={onChange}
        shape="rounded"
        showFirstButton
        showLastButton
        sx={{
          '& .MuiPaginationItem-root': {
            color: 'orangered', // sayfa numarası rengi
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: 'orangered',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#cc3700', // hover için koyu ton
            },
          },
        }}
      />
    </Box>
  );
}
