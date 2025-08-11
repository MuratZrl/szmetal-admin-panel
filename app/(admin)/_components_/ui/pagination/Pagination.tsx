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
    <Box display="flex" justifyContent="center" my={2}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={onChange}
        shape="rounded"
        showFirstButton
        showLastButton
        size={isMobile ? 'small' : 'medium'} // 📱 mobilde küçük boy
        siblingCount={isMobile ? 0 : 1} // 📱 mobilde az sayfa numarası
        boundaryCount={isMobile ? 1 : 2}
        sx={{
          '& .MuiPaginationItem-root': {
            borderRadius: 5,
            color: 'orangered',
            fontSize: isMobile ? '0.75rem' : '0.875rem', // 📱 mobilde yazı küçült
            minWidth: isMobile ? 28 : 36,
            height: isMobile ? 28 : 36,
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: 'orangered',
            color: 'white',
            '&:hover': {
              backgroundColor: '#cc3700',
            },
          },
        }}
      />
    </Box>
  );
}
