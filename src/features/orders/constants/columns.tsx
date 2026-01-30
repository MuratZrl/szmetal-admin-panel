'use client';
// src/features/orders/constants/columns.tsx

import * as React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import { type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import LabelIcon from '@mui/icons-material/Label';

import type { OrderRow } from '@/features/orders/types';

import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter'; // ← EKLENDİ

type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

type IconType = React.ElementType<{
  fontSize?: 'inherit' | 'small' | 'medium' | 'large';
}>;

/* -------------------------------- helpers ------------------------------- */

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

function pickStringField<T extends object>(row: T, keys: readonly string[]): string {
  const rec = row as unknown as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === 'string' && v.trim().length > 0) return v;
  }
  return '';
}

/** Tüm temalarda okunur “soft” chip stili */
function softChipSx(color: ChipColor): SxProps<Theme> {
  return (theme) => {
    if (color === 'default') {
      const base = theme.palette.text.primary;
      return {
        bgcolor: alpha(base, theme.palette.mode === 'light' ? 0.08 : 0.18),
        color: base,
        border: '1px solid',
        borderColor: alpha(base, 0.24),
        fontWeight: 500,
        '& .MuiChip-icon': { color: 'inherit' },
      };
    }
    const pal = theme.palette[color];
    const main = pal.main;
    return {
      bgcolor: alpha(main, theme.palette.mode === 'light' ? 0.14 : 0.22),
      color: pal.main,
      border: '1px solid',
      borderColor: alpha(main, 0.3),
      fontWeight: 500,
      '& .MuiChip-icon': { color: 'inherit' },
    };
  };
}

const STATUS_META: Record<
  OrderRow['status'],
  { label: string; color: ChipColor; Icon: IconType }
> = {
  approved: { label: 'Onaylandı', color: 'success', Icon: TaskAltIcon },
  rejected: { label: 'Reddedildi', color: 'error', Icon: CloseOutlinedIcon },
};

const DEFAULT_META: { label: string; color: ChipColor; Icon: IconType } = {
  label: 'Bilinmiyor',
  color: 'default',
  Icon: LabelIcon,
};

/* -------------------------------- columns ------------------------------- */

export function buildOrdersColumns(): GridColDef<OrderRow>[] {
  const cols: GridColDef<OrderRow>[] = [
    {
      field: 'order_code',
      headerName: 'Sipariş Kodu',
      minWidth: 180,
      flex: 0.35,
      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (p) => {
        const text = pickStringField(p.row, ['order_code', 'system_slug']);
        return (
          <Tooltip title={text} arrow>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {text}
            </span>
          </Tooltip>
        );
      },
    },

    {
      field: 'system_type',
      headerName: 'Sipariş Türü',
      minWidth: 160,
      flex: 0.25,
      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      // Kebab/underscore ise TR’ye göre insanileştir
      renderCell: (p: GridRenderCellParams<OrderRow>) => {
        const raw = pickStringField(p.row, ['system_type', 'system_slug']);
        const view =
          raw && isSlugLike(raw) ? humanizeSystemSlug(raw, 'tr-TR') : (raw || '—');

        return (
          <Tooltip title={raw || ''} arrow>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {view}
            </span>
          </Tooltip>
        );
      },
    },

    {
      field: 'message',
      headerName: 'Mesaj',
      minWidth: 320,
      flex: 0.9,
      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const text = pickStringField(params.row, ['message']);
        return (
          <Tooltip title={text} arrow>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {text}
            </span>
          </Tooltip>
        );
      },
    },

    {
      field: 'status',
      headerName: 'Durum',
      minWidth: 140,
      flex: 0.25,
      sortable: true,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<OrderRow, OrderRow['status']>) => {
        const meta = params.value ? STATUS_META[params.value] : DEFAULT_META;
        const I = meta.Icon;
        return (
          <Chip
            size="small"
            variant="filled"
            color={meta.color}
            sx={softChipSx(meta.color)}
            icon={<I fontSize="small" />}
            label={meta.label}
          />
        );
      },
    },

    {
      field: 'created_at',
      headerName: 'Sipariş Oluşturulma Tarihi',
      minWidth: 180,
      flex: 0.35,
      sortable: true,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
      valueFormatter: (value) => formatDate(typeof value === 'string' ? value : ''),
    },
  ];

  return cols;
}