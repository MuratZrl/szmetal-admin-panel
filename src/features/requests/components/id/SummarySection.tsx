// src/features/requests/components/id/SummarySection.tsx
'use client';

import * as React from 'react';
import { Paper } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

import type { SummaryItem } from '@/features/requests/types';

type Row = {
  id: string;
  toplam_kg: number | null;
  cam_metraj: number | null;
  sistem_metraj: number | null;
  kayar_cam_adet: number | null;
  kayar_cam_genislik: number | null;   // mm
  kayar_cam_yukseklik: number | null;  // mm
};

type Props = { summary: SummaryItem | null };

/** Güvenli sayı parse: "12,3" veya "12.3" → 12.3, aksi halde null */
function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toRow(s: SummaryItem | null): Row[] {
  if (!s) {
    return [{
      id: 'summary',
      toplam_kg: null,
      cam_metraj: null,
      sistem_metraj: null,
      kayar_cam_adet: null,
      kayar_cam_genislik: null,
      kayar_cam_yukseklik: null,
    }];
  }
  return [{
    id: 'summary',
    toplam_kg: num(s.toplam_kg),
    cam_metraj: num(s.cam_metraj),
    sistem_metraj: num(s.sistem_metraj),
    kayar_cam_adet: num(s.kayar_cam_adet),
    kayar_cam_genislik: num(s.kayar_cam_genislik),
    kayar_cam_yukseklik: num(s.kayar_cam_yukseklik),
  }];
}

function fmt(v: number | null, suffix = ''): string {
  return v === null || Number.isNaN(v) ? '—' : `${v}${suffix}`;
}

export default function SummarySection({ summary }: Props) {
  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    {
      field: 'toplam_kg',
      headerName: 'Toplam Ağırlık (kg)',
      minWidth: 160, flex: 0.25,
      sortable: false, editable: false, filterable: false, resizable: false, disableColumnMenu: true,
      headerAlign: 'right', align: 'right',
      renderCell: (p: { row: Row }) => fmt(p.row.toplam_kg),
    },
    {
      field: 'cam_metraj',
      headerName: 'Cam Metraj (m)',
      minWidth: 160, flex: 0.25,
      sortable: false, editable: false, filterable: false, resizable: false, disableColumnMenu: true,
      headerAlign: 'right', align: 'right',
      renderCell: (p: { row: Row }) => fmt(p.row.cam_metraj),
    },
    {
      field: 'sistem_metraj',
      headerName: 'Sistem Metraj (m)',
      minWidth: 170, flex: 0.25,
      sortable: false, editable: false, filterable: false, resizable: false, disableColumnMenu: true,
      headerAlign: 'right', align: 'right',
      renderCell: (p: { row: Row }) => fmt(p.row.sistem_metraj),
    },
    {
      field: 'kayar_cam_adet',
      headerName: 'Kayar Cam (adet)',
      minWidth: 160, flex: 0.25,
      sortable: false, editable: false, filterable: false, resizable: false, disableColumnMenu: true,
      headerAlign: 'right', align: 'right',
      renderCell: (p: { row: Row }) => fmt(p.row.kayar_cam_adet),
    },
    {
      field: 'kayar_cam_genislik',
      headerName: 'Kayar Cam Genişlik (mm)',
      minWidth: 200, flex: 0.3,
      sortable: false, editable: false, filterable: false, resizable: false, disableColumnMenu: true,
      headerAlign: 'right', align: 'right',
      renderCell: (p: { row: Row }) => fmt(p.row.kayar_cam_genislik),
    },
    {
      field: 'kayar_cam_yukseklik',
      headerName: 'Kayar Cam Yükseklik (mm)',
      minWidth: 210, flex: 0.3,
      sortable: false, editable: false, filterable: false, resizable: false, disableColumnMenu: true,
      headerAlign: 'right', align: 'right',
      renderCell: (p: { row: Row }) => fmt(p.row.kayar_cam_yukseklik),
    },
  ], []);

  const rows = React.useMemo<Row[]>(() => toRow(summary), [summary]);

  return (
    <Paper variant="outlined" sx={{ p: 0 }}>
      <DataGrid<Row>
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        autoHeight
        density="compact"
        hideFooter
        disableRowSelectionOnClick
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeader': { px: 2 },
          '& .MuiDataGrid-cell': { px: 2 },
        }}
        slots={{ noRowsOverlay: () => null }}
      />
    </Paper>
  );
}
