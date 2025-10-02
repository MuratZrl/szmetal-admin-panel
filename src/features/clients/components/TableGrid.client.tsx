// src/features/clients/components/TableGrid.client.tsx
'use client';

import * as React from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

import type { UserRow } from '@/features/clients/services/table.server';
import { buildColumns, AppRole } from '@/features/clients/constants/columns';

type Props = {
  rows: UserRow[];
  selfUserId: string | null;
  myRole: AppRole; // 'Admin' | 'Manager' | 'User'
};

export default function TableGrid({ rows, selfUserId, myRole }: Props) {
  // Parametre KALDIRILDI. Tipi net tutmak istersen sağdaki açıklama tipini ekleyebilirsin.
  const canEditRole: (row: UserRow) => boolean = React.useCallback(
    () => myRole === 'Admin',
    [myRole]
  );

  const canEditStatus = React.useCallback(
    (row: UserRow) =>
      myRole === 'Admin' || (myRole === 'Manager' && row.id === selfUserId),
    [myRole, selfUserId]
  );

  return (
    <Box sx={{ height: 'auto', width: '100%', mt: 2 }}>
      <DataGrid
        rows={rows}
        columns={buildColumns({ canEditRole, canEditStatus })}
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { pageSize: 25, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50]}
      />
      {rows.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Gösterilecek kullanıcı bulunamadı.
        </Typography>
      )}
    </Box>
  );
}
