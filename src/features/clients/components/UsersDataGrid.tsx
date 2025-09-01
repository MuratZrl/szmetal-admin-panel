'use client';
import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import type { Database } from '@/types/supabase';
import { Box } from '@mui/material';
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
    <Box style={{ width: '100%' }} >
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
      />
    </Box>
  );
}
