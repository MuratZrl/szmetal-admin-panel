'use client';
import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import type { Database } from '@/types/supabase';
type User = Database['public']['Tables']['users']['Row'];

export default function UsersDataGrid({
  rows,
  columns,
  loading,
  pageSize = 20,
}: {
  rows: User[];
  columns: GridColDef[];
  loading?: boolean;
  pageSize?: number;
}) {
  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        loading={loading}
        autoHeight
        hideFooter
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { pageSize, page: 0 } },
        }}
        sx={{
          borderRadius: 5,
          '& .MuiDataGrid-columnHeader': {
            backgroundImage: 'linear-gradient(to top, #111111ff, #4a4a4a)',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'white',
            fontWeight: 600,
          },
        }}
      />
    </div>
  );
}
