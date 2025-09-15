// src/features/requests/components/id/columns.tsx
'use client';

import * as React from 'react';
import { Box, Typography, Link } from '@mui/material';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { MaterialRow } from '@/features/requests/types';

function textOrDash(v: string | null | undefined): string {
  const s = v == null ? '' : String(v).trim();
  return s.length > 0 ? s : '---';
}

function toNumberStrict(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.trim().replace(/\s+/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// Tek satırlık yardımcı: hücre içeriğini dikey ortala
function CellCenter({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
      {children}
    </Box>
  );
}

export function buildMaterialColumns(): GridColDef<MaterialRow>[] {
  const cols: GridColDef<MaterialRow>[] = [
    {
      field: 'profil_resmi',
      headerName: 'Görsel',
      width: 90,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p: GridRenderCellParams<MaterialRow, string | null>) => {
        const src = p.value ?? '';
        if (!src) return <Typography variant="body2">---</Typography>;
        return (
          <Link
            href={src}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={p.row.profil_adi}
              loading="lazy"
              style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 4 }}
            />
          </Link>
        );
      },
    },
    {
      field: 'profil_kodu',
      headerName: 'Kod',
      width: 120,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <CellCenter>
          <Typography variant="body2" sx={{ whiteSpace: 'normal' }}>
            {textOrDash(p.value as string | null)}
          </Typography>
        </CellCenter>
      ),
    },
    {
      field: 'profil_adi',
      headerName: 'Profil Adı',
      flex: 1,
      minWidth: 200,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <CellCenter>
          <Typography variant="body2" sx={{ whiteSpace: 'normal' }}>
            {textOrDash(p.value as string | null)}
          </Typography>
        </CellCenter>
      ),
    },

    // ← İstediğin sıraya göre: Profil Adı'ndan hemen sonra Birim Ağırlık
    {
      field: 'birim_agirlik',
      headerName: 'Birim Ağırlık (gr/m)',
      width: 180,
      flex: 1,
      type: 'number',
      align: 'left',
      headerAlign: 'left',

      // Sıralama/filtre için grid değerini netleştir
      valueGetter: (_value, row) => toNumberStrict(row.birim_agirlik),

      // Ekran gösterimini kendimiz yönetiyoruz
      renderCell: (p) => {
        const n = toNumberStrict(p.row.birim_agirlik);
        return (
          <CellCenter>
            <Typography variant="body2">{n == null ? '---' : n.toFixed(3)}</Typography>
          </CellCenter>
        );
      },

      // Ek garanti: numerik comparator
      sortComparator: (a, b) => {
        const A = toNumberStrict(a);
        const B = toNumberStrict(b);
        if (A == null && B == null) return 0;
        if (A == null) return 1;
        if (B == null) return -1;
        return A - B;
      },
    },

    {
      field: 'kesim_olcusu',
      headerName: 'Kesim Ölçüsü (mm)',
      width: 140,
      flex: 1,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <CellCenter>
          <Typography variant="body2">{textOrDash(p.value as string | null)}</Typography>
        </CellCenter>
      ),
    },
    {
      field: 'kesim_adet',
      headerName: 'Kesim Adet',
      width: 120,
      flex: 1,
      type: 'number',
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'verilecek_adet',
      headerName: 'Verilecek Adet',
      width: 150,
      flex: 1,
      type: 'number',
      align: 'left',
      headerAlign: 'left',
    },
  ];

  return cols;
}

// Kullanmak istersen hazır dizi de export ediyorum
export const MATERIAL_COLUMNS: GridColDef<MaterialRow>[] = buildMaterialColumns();
export default MATERIAL_COLUMNS;
