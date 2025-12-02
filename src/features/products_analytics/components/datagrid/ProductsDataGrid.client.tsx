// src/features/products_analytics/datagrid/ProductsDataGrid.client.tsx
'use client';

import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {
  type ProductAnalyticsRow,
  productAnalyticsColumns,
} from './columns';

type Props = {
  rows: ProductAnalyticsRow[];
  /** Grid yüksekliği (px). Varsayılan: 600 */
  height?: number;
};

export default function ProductsDataGrid({ rows, height = 600 }: Props) {
  const total = rows.length;

  return (
    <Box sx={{ width: '100%' }}>

      <Box sx={{ height }}>
        <DataGrid<ProductAnalyticsRow>
          rows={rows}
          columns={productAnalyticsColumns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          autoHeight={false}
          density="compact"
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 50,
              },
            },
            sorting: {
              sortModel: [{ field: 'code', sort: 'asc' }],
            },
          }}
          sx={{
            '& .MuiDataGrid-cell.category-cell': {
              display: 'flex',
              alignItems: 'center',
              py: 0,           // 🔹 üst-alt padding’i eşitle / azalt
            },
          }}
        />
      </Box>
    </Box>
  );
}
