'use client';

import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { productColumns } from '@/constants/categories/columns';

export type Product = {
  id: string; // UUID
  title: string;
  description: string;
  image: string;
  stock: number;
  unit_weight: number;
  created_at: string;
  sub_category_id: string;
};

type Props = {
  rows: Product[];
};

export default function ProductTable({ rows }: Props) {
  return (
    <Box style={{ height: 600, width: '100%', padding: '16px' }} >
      <DataGrid
        rows={rows}
        columns={productColumns}
        getRowId={(row) => row.id}

        disableRowSelectionOnClick
        hideFooter

        initialState={{
          pagination: {
            paginationModel: { pageSize: 20, page: 0 },
          },
        }}
        sx={{
          borderRadius: 5,
          '& .MuiDataGrid-columnHeader': {
            backgroundImage: 'linear-gradient(to top, #111111ff, #4a4a4a)',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'white',
            fontWeight: 600,
          },
        }}
      />  
    </Box>
  );
}
