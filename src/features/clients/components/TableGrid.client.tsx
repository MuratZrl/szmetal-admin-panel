// src/features/clients/components/TableGrid.client.tsx
'use client';

import * as React from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

import type { UserRow } from '@/features/clients/services/table.server';
// DİKKAT: buildColumns nerede? components/columns.tsx ise bu yolu kullan:
import { buildColumns, type AppRole } from '../constants/columns';
// Eğer gerçekten constants/columns altındaysa üst satırı eski haline döndür.

type Props = {
  rows: UserRow[];
  selfUserId: string | null;
  myRole: AppRole; // 'Admin' | 'Manager' | 'User'
};

export default function TableGrid({ rows, selfUserId, myRole }: Props) {
  // Rol düzenleme: sadece Admin
  const canEditRole = React.useCallback(
    (_row: UserRow) => {
      void _row; // kullanılmadı ama bilerek
      return myRole === 'Admin';
    },
    [myRole]
  );

  // Durum düzenleme: örnek politika
  // - Admin: herkesi düzenler
  // - Manager: sadece kendi kaydını düzenler
  // Bunu istemiyorsan "myRole !== 'User'" yapabilirsin.
  const canEditStatus = React.useCallback(
    (row: UserRow) =>
      myRole === 'Admin' || (myRole === 'Manager' && row.id === selfUserId),
    [myRole, selfUserId]
  );

  // Yeni: Silme izni
  // - Sadece Admin
  // - Kendini silemez
  // Artık “kendi değil” filtresini burada yapmak zorunda değilsin
  const canDeleteUser = React.useCallback(
    (_row: UserRow) => {
      void _row;
      return myRole === 'Admin';
    },
    [myRole]
  );

  return (
    <Box sx={{ height: 'auto', width: '100%', mt: 2 }}>
      <DataGrid
        rows={rows}
        columns={buildColumns({ canEditRole, canEditStatus, canDeleteUser, selfUserId })} // ← YENİ param
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
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
