// src/features/orders/components/OrdersGrid.client.tsx
'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { OrderRow } from '@/features/orders/types';
import { buildOrdersColumns } from '@/features/orders/constants/columns';

type Props = { initialRows: OrderRow[] };

export default function OrdersGrid({ initialRows }: Props) {
  const columns = React.useMemo(buildOrdersColumns, []);
  return (
    <Box sx={{ height: 560, width: '100%' }}>
      <DataGrid
        rows={initialRows}
        columns={columns}
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
          sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
        }}
      />
    </Box>
  );
}
