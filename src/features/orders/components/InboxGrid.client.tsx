'use client';
// src/features/orders/components/InboxGrid.client.tsx

import * as React from 'react';
import { Box } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { Database } from '@/types/supabase';
import type { OrderRow } from '@/features/orders/types';
import { buildOrdersColumns } from '@/features/orders/constants/columns';

type OrdersDbRow = Database['public']['Tables']['orders']['Row'];

type Props = { initialRows: OrderRow[]; userId: string };

function map(r: OrdersDbRow): OrderRow {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    request_id: r.request_id ? String(r.request_id) : null,
    order_code: r.order_code ?? null,
    system_slug: r.system_slug ?? null,
    system_type: r.system_type ?? null,
    message: r.message ?? '',
    status: r.status === 'approved' ? 'approved' : 'rejected',
    is_read: Boolean(r.is_read),
    read_at: r.read_at ?? null,
    created_at: r.created_at ?? new Date().toISOString(),
    updated_at: r.updated_at ?? new Date().toISOString(),
  };
}

export default function InboxGrid({ initialRows, userId }: Props) {
  const [rows, setRows] = React.useState<OrderRow[]>(initialRows);
  const columns = React.useMemo<GridColDef<OrderRow>[]>(() => buildOrdersColumns(), []);

  React.useEffect(() => {
    const ch = supabase
      .channel(`orders_inbox_${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
        (payload) => {
          const next = map(payload.new as OrdersDbRow);

          setRows((prev) => {
            // insert/update merge
            const idx = prev.findIndex((r) => r.id === next.id);
            if (idx === -1) return [next, ...prev];
            const copy = prev.slice();
            copy[idx] = next;
            return copy;
          });
        })
      .subscribe();

    return () => { void supabase.removeChannel(ch); };
  }, [userId]);

  return (
    <Box sx={{ height: 560, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 10 } },
          sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
        }}
      />
    </Box>
  );
}
