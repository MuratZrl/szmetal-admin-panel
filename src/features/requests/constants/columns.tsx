// src/features/requests/components/columns.tsx
'use client';

import * as React from 'react';

import NextLink from 'next/link';

import { Avatar, Box, Link as MUILink, Tooltip, Typography, Button, Chip, useTheme, alpha, Stack } from '@mui/material';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import type { RequestTableRow } from '@/features/requests/types';

import { RequestStatus } from '@/features/requests/types';

import { humanizeSystemSlug } from '@/utils/caseFilter';

const REQUEST_STATUS = ['pending','approved','rejected'] as const;

function statusLabelTR(value: string | null | undefined): string {
  switch ((value ?? '').toLowerCase()) {
    case 'pending':  return 'Bekleyen';
    case 'approved': return 'Onaylandı';
    case 'rejected': return 'Reddedildi';
    default:         return '---';
  }
}

function StatusChipCell({ value }: { value: string | null | undefined }) {
  const theme = useTheme();
  const raw = (value ?? '').toLowerCase();
  const isKnown = (REQUEST_STATUS as readonly string[]).includes(raw);
  const key = (isKnown ? raw : '') as RequestStatus | '';

  const style = key
    ? theme.palette.requestStatus[key]
    : {
        bg: alpha(theme.palette.text.primary, 0.08),
        fg: theme.palette.text.primary,
        bd: alpha(theme.palette.text.primary, 0.16),
      };

  return (
    <Chip
      size="small"
      label={statusLabelTR(key || null)}
      color="default"
      variant="filled"
      sx={{
        '&&': {
          backgroundColor: style.bg,
          color: style.fg,
          borderColor: style.bd ?? 'transparent',
          borderWidth: style.bd ? 1 : 0,
          borderStyle: style.bd ? 'solid' : 'none',
          fontWeight: 600,
        },
        '& .MuiChip-icon, & .MuiChip-deleteIcon': { color: 'inherit' },
      }}
    />
  );
}

function fallbackText(value: string | null | undefined): string {
  const s = value == null ? '' : String(value).trim();
  return s.length > 0 ? s : '---';
}


export type ChangeableStatus = Extract<RequestStatus, 'approved' | 'rejected'>;
export type OnChangeStatus = (id: string, next: ChangeableStatus) => Promise<void>;
export type IsPending = (id: string) => boolean;

// src/features/requests/components/columns.tsx
export function buildRequestHrefString(row: RequestTableRow, basePath: string = '/requests'): string | null {
  const id = row.id != null ? String(row.id) : null;
  if (!id) return null;
  return `${basePath}/${encodeURIComponent(id)}`;
}


export function buildColumns(opts?: { onChangeStatus?: OnChangeStatus; isPending?: IsPending }): GridColDef<RequestTableRow>[] {
  const onChangeStatus = opts?.onChangeStatus;
  const isPending = opts?.isPending ?? (() => false);

  const cols: GridColDef<RequestTableRow>[] = [
    {
      field: 'image',
      headerName: 'Görsel',
      width: 80,

      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams<RequestTableRow, string | null>) => {
        const img = params.row.image ?? null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 1 }}>
            <Avatar src={img ?? undefined} />
          </Box>
        );
      },
    },
    
    {
      field: 'username',
      headerName: 'Kullanıcı',
      flex: 1,
      minWidth: 140,
      align: 'left',
      headerAlign: 'left',
      
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: 1, width: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'normal', width: 1 }}>
            {fallbackText(params.value ?? params.row.username)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'E-posta',
      flex: 1.2,
      minWidth: 180,
      align: 'left',
      headerAlign: 'left',

      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: (params: GridRenderCellParams<RequestTableRow, string | null>) => {
        const v = params.value ?? null;
        if (!v) return <Typography variant="body2">---</Typography>;
        return (
          <Tooltip title={v}>
            <MUILink
              href={`mailto:${v}`}
              underline="hover"
              variant="body2"
              sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {v}
            </MUILink>
          </Tooltip>
        );
      },
    },
    {
      field: 'system_slug',
      headerName: 'Sistem',
      flex: 0.9,
      minWidth: 160,
      align: 'left',
      headerAlign: 'left',

      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      // İstersen sıralamayı da insanlaştırılmış metne göre yap:
      sortComparator: (v1, v2) =>
        humanizeSystemSlug(String(v1 ?? '')).localeCompare(
          humanizeSystemSlug(String(v2 ?? '')),
          'tr'
        ),
      renderCell: (params) => {
        const label = humanizeSystemSlug(params.value ?? params.row.system_slug ?? null);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 1, width: 1 }}>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'normal', width: 1 }}
              title={label}
            >
              {label}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'phone',
      headerName: 'Telefon',
      flex: 0.9,
      minWidth: 160,
      align: 'left',
      headerAlign: 'left',

      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: (params) => {
        const v = params.value ?? null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 1 }}>
            {v ? (
              <MUILink href={`tel:${v}`} variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                {v}
              </MUILink>
            ) : (
              <Typography variant="body2">---</Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'company',
      headerName: 'Şirket',
      flex: 1.2,
      minWidth: 200,
      align: 'left',
      headerAlign: 'left',

      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: 1, width: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'normal', width: 1 }}>
            {fallbackText(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'country',
      headerName: 'Ülke',
      flex: 1,
      align: 'left',
      headerAlign: 'left',

      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: 1 }}>
          <Typography variant="body2">{fallbackText(params.value)}</Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      flex: 0.9,
      minWidth: 140,
      align: 'left',
      headerAlign: 'left',

      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: (params) => <StatusChipCell value={params.value ?? params.row.status ?? null} />,
    },
    {
      field: 'detail',
      headerName: 'Detaylar',
      flex: 0.9,
      width: 120,

      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      align: 'left',
      headerAlign: 'left',
      disableExport: true,
      renderCell: (params: GridRenderCellParams<RequestTableRow, null>) => {
        const hrefStr = buildRequestHrefString(params.row, '/requests'); // gerekiyorsa '/admin/requests'
        const disabled = hrefStr == null;

        return (
          <Button
            LinkComponent={NextLink}
            href={disabled ? undefined : hrefStr}   // ← string ya da undefined
            variant="text"
            size="small"
            onClick={(e) => e.stopPropagation()}   // satır seçimini engelle
            disabled={disabled}
          >
            Görüntüle
          </Button>
        );
      },
    },
    {
      field: 'quickActions',
      headerName: 'Hızlı İşlem',
      width: 190,
      flex: 1,

      sortable: false,
      editable: false,
      resizable: false,
      filterable: false,
      disableColumnMenu: true,

      align: 'left',
      headerAlign: 'left',
      disableExport: true,
      renderCell: (params: GridRenderCellParams<RequestTableRow, null>) => {
        const id = params.row.id != null ? String(params.row.id) : '';
        const raw = params.row.status ?? 'pending';
        const status = (typeof raw === 'string' ? raw.toLowerCase() : 'pending') as RequestStatus;
        const disabledBase = !id || status !== 'pending';
        const pending = isPending(id);

        const handleClick = async (next: ChangeableStatus) => {
          if (!onChangeStatus || disabledBase || pending) return;
          await onChangeStatus(id, next);
        };

        return (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ height: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="success"
              disabled={disabledBase || pending}
              onClick={(e) => { e.stopPropagation(); handleClick('approved'); }}
            >
              Onayla
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={disabledBase || pending}
              onClick={(e) => { e.stopPropagation(); handleClick('rejected'); }}
            >
              Reddet
            </Button>
          </Stack>
        );
      },
    }
  ];

  return cols;
}
