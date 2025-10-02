// src/features/orders/components/constants/columns.tsx
'use client';

import * as React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import type { OrderRow } from '@/features/orders/types';

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LabelIcon from '@mui/icons-material/Label';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

type IconType = React.ElementType<SvgIconProps>;

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

function toKey(v: unknown): string {
  return typeof v === 'string' ? v.trim().toLowerCase() : '';
}

/** Tüm temalarda okunur “soft” chip stili, her renge farklı ton */
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
      borderColor: alpha(main, 0.30),
      fontWeight: 500,
      '& .MuiChip-icon': { color: 'inherit' },
    };
  };
}

/** Type → Türkçe Chip meta */
const TYPE_META: Record<string, { label: string; color: ChipColor; Icon: IconType }> = {
  success: { label: 'Olumlu', color: 'success',   Icon: TaskAltIcon },
  error:   { label: 'Olumsuz',     color: 'error',     Icon: ErrorOutlineIcon },
};

const DEFAULT_TYPE_META: { label: string; color: ChipColor; Icon: IconType } = {
  label: 'Diğer',
  color: 'default',
  Icon: LabelIcon,
};

export function buildOrdersColumns(): GridColDef<OrderRow>[] {
  const createdAtCol: GridColDef<OrderRow, string> = {
    field: 'created_at',
    headerName: 'Oluşturma Tarihi',
    minWidth: 180,
    flex: 0.25,
    
    sortable: false,
    editable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
    
    valueFormatter: (value) =>
      formatDate(typeof value === 'string' ? value : ''),
  };

  const cols: GridColDef<OrderRow>[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      minWidth: 240, 
      flex: 0.7,
      
      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
    },

    {
      field: 'title',
      headerName: 'Başlık',
      minWidth: 220,
      flex: 0.5,
      
      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
      
      renderCell: (params: GridRenderCellParams<OrderRow>) => {
        const text = params.row.title ?? params.row.tille ?? '';
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
      field: 'message',
      headerName: 'Mesaj',
      minWidth: 280,
      flex: 0.75,
      
      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
      
      renderCell: (params: GridRenderCellParams<OrderRow>) => {
        const text = params.row.message ?? '';
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
      field: 'type',
      headerName: 'Durum',
      flex: 0.25,
      
      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
      
      renderCell: (params: GridRenderCellParams<OrderRow, string | null>) => {
        const raw = typeof params.value === 'string' ? params.value : '';
        const key = toKey(raw);
        const meta = TYPE_META[key] ?? { ...DEFAULT_TYPE_META, label: raw || DEFAULT_TYPE_META.label };
        const I = meta.Icon;
        return (
          <Chip
            size="small"
            variant="filled"
            color={meta.color}            // çeşit çeşit renk
            sx={softChipSx(meta.color)}   // soft arkaplan
            icon={<I fontSize="small" />}
            label={meta.label}
          />
        );
      },
    },

    {
      field: 'is_read',
      headerName: 'Okundu',
      flex: 0.3,
      
      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,
      
      renderCell: (params: GridRenderCellParams<OrderRow, boolean | null>) => {
        const okundu = Boolean(params.value);
        const color: ChipColor = okundu ? 'success' : 'warning'; // yeşil/amber
        return (
          <Chip
            size="small"
            variant="filled"
            sx={softChipSx(color)}
            icon={okundu ? <DoneAllIcon fontSize="small" /> : <CloseOutlinedIcon fontSize="small" />}
            label={okundu ? 'Okundu' : 'Okunmadı'}
            color={color}
          />
        );
      },
    },

    createdAtCol,
  ];

  return cols;
}
