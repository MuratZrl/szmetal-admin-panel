'use client';
// src/features/clients/components/TableGrid.client.tsx

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

import type { UserRow } from '@/features/clients/services/table.server';
import { buildColumns, type AppRole } from '../constants/columns';

type Props = {
  rows: UserRow[];
  selfUserId: string | null;
  myRole: AppRole; // 'Admin' | 'Manager' | 'User'
};

export default function TableGrid({ rows, selfUserId, myRole }: Props) {
  // 1) rows'u kontrollü state yap
  const [items, setItems] = React.useState<UserRow[]>(rows);
  React.useEffect(() => { setItems(rows); }, [rows]);

  // 2) immutable patch helpers
  const patchRow = React.useCallback((id: string, patch: Partial<UserRow>) => {
    setItems(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const restoreRow = React.useCallback((snapshot: UserRow) => {
    setItems(prev => prev.map(r => (r.id === snapshot.id ? snapshot : r)));
  }, []);

  const removeRow = React.useCallback((id: string) => {
    setItems(prev => prev.filter(r => r.id !== id));
  }, []);

  // 3) yetkiler (kullanılmayan parametre yok → lint susar)
  const canEditRole = React.useCallback(() => myRole === 'Admin', [myRole]);
  const canEditStatus = React.useCallback(
    (row: UserRow) => myRole === 'Admin' || (myRole === 'Manager' && row.id === selfUserId),
    [myRole, selfUserId]
  );
  const canDeleteUser = React.useCallback(() => myRole === 'Admin', [myRole]);

  return (
    <Box sx={{ height: 'auto', width: '100%', mt: 2 }}>
      <DataGrid
        rows={items}
        columns={buildColumns({
          canEditRole,
          canEditStatus,
          canDeleteUser,
          selfUserId,
          patchRow,
          restoreRow,
          removeRow,
        })}
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
        pageSizeOptions={[10, 25, 50]}
      />
      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Gösterilecek kullanıcı bulunamadı.
        </Typography>
      )}
    </Box>
  );
}