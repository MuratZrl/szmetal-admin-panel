// src/features/requests/components/TableGrid.client.tsx
'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { RequestTableRow } from '@/features/requests/services/table.server';
import { buildColumns } from '@/features/requests/constants/columns';

type Props = {
  rows: RequestTableRow[];
};

/**
 * Basit, client-side DataGrid entegrasyonu.
 * - Server'dan gelen rows'u gösterir.
 * - Client-side pagination/sorting kullanır (server-side istersen ekleyelim).
 */
export default function TableGrid({ rows }: Props) {
  const columns = React.useMemo(() => buildColumns(), []);

  return (
    <Box sx={{ height: 'auto', width: '100%', mt: 2 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}

        disableRowSelectionOnClick

        initialState={{
          pagination: { paginationModel: { pageSize: 25, page: 0 } },
          sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
        }}

        pageSizeOptions={[10, 25, 50]}
      />

      {rows.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Gösterilecek talep bulunamadı.
        </Typography>
      )}
    </Box>
  );
}
