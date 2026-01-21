'use client'
// src/features/requests/components/TableGrid.client.tsx

import * as React from 'react';
import { Box } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { MaterialRow } from '@/features/requests/types';
import { buildMaterialColumns } from '@/features/requests/constants/id/columns';

export default function MaterialTable({ rows }: { rows: MaterialRow[] }) {
  const columns: GridColDef<MaterialRow>[] = React.useMemo(() => buildMaterialColumns(), []);

  React.useEffect(() => {
    // sanity log: ilk satır ne?
    // 2.485 ve 'number' görmelisin
    if (rows.length > 0) {
      console.log('material sample:', {
        birim_agirlik: rows[0]?.birim_agirlik,
        type: typeof rows[0]?.birim_agirlik,
      });
    }
  }, [rows]);

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        autoHeight
        initialState={{
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        sx={{
          '& .MuiDataGrid-cell': { alignItems: 'center' },
          '& .MuiDataGrid-cell > *': { width: '100%' },
        }}
      />
    </Box>
  );
}
