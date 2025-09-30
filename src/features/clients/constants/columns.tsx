// src/features/clients/components/columns.tsx
'use client';

import * as React from 'react';

import { Box, Avatar, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  type GridColDef,
  type GridRenderCellParams,
  useGridApiContext,
} from '@mui/x-data-grid';

import type { UserRow } from '@/features/clients/services/table.server';

/* -------------------------------------------------------------------------- */
/* Sabitler                                                                    */
/* -------------------------------------------------------------------------- */

export const ROLE_OPTIONS = ['Admin', 'Manager', 'User'] as const;
export type AppRole = (typeof ROLE_OPTIONS)[number];

export const STATUS_OPTIONS = ['Active', 'Inactive', 'Banned'] as const;
export type AppStatus = (typeof STATUS_OPTIONS)[number];

// TR etiketleri (değer DB’de İngilizce kalır)
export const ROLE_LABELS_TR: Record<AppRole, string> = {
  Admin: 'Admin',
  Manager: 'Yönetici',
  User: 'Kullanıcı',
};

export const STATUS_LABELS_TR: Record<AppStatus, string> = {
  Active: 'Aktif',
  Inactive: 'İnaktif',
  Banned: 'Banlanmış',
};

/* -------------------------------------------------------------------------- */

function fallbackText(value: string | null | undefined): string {
  const s = value == null ? '' : String(value).trim();
  return s.length > 0 ? s : '---';
}

/* -------------------------------------------------------------------------- */
/* Role Select Cell                                                            */
/* -------------------------------------------------------------------------- */

type RoleSelectCellProps =
  GridRenderCellParams<UserRow, AppRole | null> & { editable: boolean };

function RoleSelectCell(props: RoleSelectCellProps) {
  const { editable, id, field, value: rawValue } = props;
  const apiRef = useGridApiContext();
  const value = rawValue ?? ('' as unknown as AppRole);

  const handleChange = (e: SelectChangeEvent<AppRole>) => {
    if (!editable) return;
    const next = e.target.value as AppRole;
    const prev = value;

    // optimistic
    apiRef.current.updateRows([
      { id: id as UserRow['id'], [field]: next } as Partial<UserRow> & { id: UserRow['id'] },
    ]);

    // persist
    void (async () => {
      const res = await fetch('/api/clients/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(id), role: next }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // revert
        apiRef.current.updateRows([
          { id: id as UserRow['id'], [field]: prev } as Partial<UserRow> & { id: UserRow['id'] },
        ]);
      }
    })();
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      size="small"
      fullWidth
      displayEmpty
      disabled={!editable}
      aria-readonly={!editable}
      renderValue={(v) => (v ? ROLE_LABELS_TR[v as AppRole] : '---')}
    >
      {ROLE_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {ROLE_LABELS_TR[opt]}
        </MenuItem>
      ))}
    </Select>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Select Cell                                                          */
/* -------------------------------------------------------------------------- */

type StatusSelectCellProps =
  GridRenderCellParams<UserRow, AppStatus | null> & { editable: boolean };

function StatusSelectCell(props: StatusSelectCellProps) {
  const { editable, id, field, value: rawValue } = props;
  const apiRef = useGridApiContext();
  const value = rawValue ?? ('' as unknown as AppStatus);

  const handleChange = (e: SelectChangeEvent<AppStatus>) => {
    if (!editable) return;
    const next = e.target.value as AppStatus;
    const prev = value;

    // optimistic
    apiRef.current.updateRows([
      { id: id as UserRow['id'], [field]: next } as Partial<UserRow> & { id: UserRow['id'] },
    ]);

    // persist
    void (async () => {
      const res = await fetch('/api/clients/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(id), status: next }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // revert
        apiRef.current.updateRows([
          { id: id as UserRow['id'], [field]: prev } as Partial<UserRow> & { id: UserRow['id'] },
        ]);
      }
    })();
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      size="small"
      fullWidth
      displayEmpty
      disabled={!editable}
      aria-readonly={!editable}
      renderValue={(v) => (v ? STATUS_LABELS_TR[v as AppStatus] : '---')}
    >
      {STATUS_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {STATUS_LABELS_TR[opt]}
        </MenuItem>
      ))}
    </Select>
  );
}

/* -------------------------------------------------------------------------- */
/* Kolonlar                                                                    */
/* -------------------------------------------------------------------------- */

export function buildColumns(
  { editableRole, editableStatus }: { editableRole?: boolean; editableStatus?: boolean } = {}
): GridColDef<UserRow>[] {
  const cols: GridColDef<UserRow>[] = [
    {
      field: 'image',
      headerName: 'Görsel',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) => {
        const src = params.value ?? undefined;
        const name = params.row.username ?? params.row.email;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 1 }}>
            <Avatar src={src} alt={name ?? 'user'} />
          </Box>
        );
      },
    },
    {
      field: 'username',
      headerName: 'Kullanıcı Adı',
      flex: 1,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },
    {
      field: 'email',
      headerName: 'E-posta',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },

    // ROLE
    {
      field: 'role',
      headerName: 'Rol',
      flex: 1,
      minWidth: 160,
      align: 'left',
      headerAlign: 'left',
      cellClassName: 'col-role-left',
      editable: false,
      type: 'singleSelect',
      valueOptions: ROLE_OPTIONS.map((v) => ({ value: v, label: ROLE_LABELS_TR[v] })),
      renderCell: (params) => <RoleSelectCell {...params} editable={!!editableRole} />,
      sortComparator: (a, b) =>
        ROLE_OPTIONS.indexOf((a ?? 'User') as AppRole) -
        ROLE_OPTIONS.indexOf((b ?? 'User') as AppRole),
      // DataGrid v7: formatter yalnızca value alır
      valueFormatter: (value) => (value ? ROLE_LABELS_TR[value as AppRole] : '---'),
    },

    {
      field: 'company',
      headerName: 'Şirket',
      flex: 1,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },

    // STATUS
    {
      field: 'status',
      headerName: 'Durum',
      flex: 1,
      minWidth: 160,
      align: 'left',
      headerAlign: 'left',
      cellClassName: 'col-status-left',
      editable: false,
      type: 'singleSelect',
      valueOptions: STATUS_OPTIONS.map((v) => ({ value: v, label: STATUS_LABELS_TR[v] })),
      renderCell: (params: GridRenderCellParams<UserRow, AppStatus | null>) => (
        <StatusSelectCell {...params} editable={!!editableStatus} />
      ),
      sortComparator: (a, b) =>
        STATUS_OPTIONS.indexOf((a ?? 'Active') as AppStatus) -
        STATUS_OPTIONS.indexOf((b ?? 'Active') as AppStatus),
      valueFormatter: (value) => (value ? STATUS_LABELS_TR[value as AppStatus] : '---'),
    },

    {
      field: 'phone',
      headerName: 'Telefon',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },
    {
      field: 'country',
      headerName: 'Ülke',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },
  ];

  return cols;
}
