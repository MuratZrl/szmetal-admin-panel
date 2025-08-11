'use client';

import { Box, Pagination } from '@mui/material';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function CustomPagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <Box display="flex" justifyContent="center" my={2}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={onChange}
        shape="rounded"
        showFirstButton
        showLastButton
        sx={{
          '& .MuiPaginationItem-root': {
            borderRadius: 5,
            color: 'orangered', // sayfa numarası rengi
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: 'orangered',
            color: 'white',
            '&:hover': {
              backgroundColor: '#cc3700', // hover için koyu ton
            },
          },
        }}
      />
    </Box>
  );
}
