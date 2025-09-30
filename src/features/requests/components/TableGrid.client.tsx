// src/features/requests/components/TableGrid.client.tsx
'use client';

import * as React from 'react';

import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import type { RequestTableRow } from '@/features/requests/types';

// DİKKAT: buildColumns'ın "opts" alanını destekleyen sürümünü import et.
import { buildColumns, type ChangeableStatus } from '@/features/requests/constants/columns';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

type Props = {
  rows: RequestTableRow[];
};

export default function TableGrid({ rows: serverRows }: Props) {
  const { show } = useSnackbar();

  // 1) Local state: optimistic güncelleme için şart
  const [rows, setRows] = React.useState<RequestTableRow[]>(serverRows);

  // 2) Server’dan gelen data güncellenirse senkronize et
  React.useEffect(() => {
    setRows(serverRows);
  }, [serverRows]);

  // 3) Eşzamanlı işlem kilidi için basit map
  const [pendingMap, setPendingMap] = React.useState<Record<string, boolean>>({});

  const isPending = React.useCallback((id: string) => !!pendingMap[id], [pendingMap]);

  const setPending = React.useCallback((id: string, v: boolean) => {
    setPendingMap(prev => ({ ...prev, [id]: v }));
  }, []);

  // 4) Handler: API'ye yaz, optimistic güncelle, hata olursa geri al
  const onChangeStatus = React.useCallback(
    async (id: string, next: ChangeableStatus) => {
      const prevRows = rows;

      // optimistic
      setPending(id, true);
      setRows(prev =>
        prev.map(r => (String(r.id) === id ? { ...r, status: next } : r))
      );

      try {
        const res = await fetch(`/api/requests/${encodeURIComponent(id)}/status`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: next }),
        });

        if (!res.ok) {
          // geri al
          setRows(prevRows);
          const errJson = (await res.json().catch(() => null)) as unknown;
          const msg =
            errJson && typeof errJson === 'object' && 'error' in (errJson as Record<string, unknown>)
              ? String((errJson as Record<string, unknown>).error)
              : `HTTP ${res.status}`;
          show(`İşlem başarısız: ${msg}`, 'error');
          return;
        }

        show(next === 'approved' ? 'Talep onaylandı.' : 'Talep reddedildi.', 'success');
      } catch {
        setRows(prevRows);
        show('Bağlantı hatası.', 'error');
      } finally {
        setPending(id, false);
      }
    },
    [rows, setPending, show]
  );

  // 5) Kolonları handler ve pending ile üret
  const columns = React.useMemo(
    () => buildColumns({ onChangeStatus, isPending }),
    [onChangeStatus, isPending]
  );

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
