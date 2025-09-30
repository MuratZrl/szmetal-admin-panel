// src/features/clients/components/TableGrid.client.tsx
'use client';

import * as React from 'react';

import { DataGrid, GridRowModel } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

import type { UserRow } from '@/features/clients/services/table.server';

import { buildColumns, ROLE_OPTIONS, type AppRole } from '@/features/clients/constants/columns';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

type Props = { rows: UserRow[] };

export default function TableGrid({ rows }: Props) {
  const { show } = useSnackbar(); // ← sadece show var

  const processRowUpdate = React.useCallback(
    async (newRow: GridRowModel<UserRow>, oldRow: GridRowModel<UserRow>) => {
      // Rol değişmemişse server’a gitme
      if (newRow.role === oldRow.role) return newRow;

      // Tip güvenliği
      const nextRole = newRow.role as AppRole | null;
      if (!nextRole || !ROLE_OPTIONS.includes(nextRole)) {
        throw new Error('Geçersiz rol');
      }

      const res = await fetch('/api/clients/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newRow.id, role: nextRole }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.error ?? 'Güncelleme başarısız';
        throw new Error(msg);
      }

      show('Rol güncellendi', 'success');
      return newRow;
    },
    [show]
  );

  return (
    <Box sx={{ height: 'auto', width: '100%', mt: 2 }}>
      <DataGrid
        rows={rows}
        columns={buildColumns({ editableRole: true, editableStatus: true })}
        getRowId={(r) => r.id}

        editMode="cell"
        processRowUpdate={processRowUpdate}
        disableRowSelectionOnClick // hücre içi tıklamalar satır seçmesin

        onProcessRowUpdateError={(err) => {
          const msg = err instanceof Error ? err.message : 'Güncelleme hatası';
          show(msg, 'error');
        }}

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
