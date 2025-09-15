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

function fallbackText(value: string | null | undefined): string {
  const s = value == null ? '' : String(value).trim();
  return s.length > 0 ? s : '---';
}

export const ROLE_OPTIONS = ['Admin', 'Manager', 'User'] as const;
export type AppRole = typeof ROLE_OPTIONS[number];

export const STATUS_OPTIONS = ['Active', 'Inactive', 'Banned'] as const;
export type AppStatus = typeof STATUS_OPTIONS[number];

// Her zaman Select, ama editable değilse disabled
type RoleSelectCellProps =
  GridRenderCellParams<UserRow, AppRole | null> & { editable: boolean };

// Hücre için "her zaman Select" bileşeni
function RoleSelectCell(props: RoleSelectCellProps) {
  const { editable, id, field, value: rawValue } = props;
  const apiRef = useGridApiContext();
  const value = rawValue ?? ('' as unknown as AppRole);

  // Role
  const handleChange = (e: SelectChangeEvent<AppRole>) => {
    if (!editable) return;
    const next = e.target.value as AppRole;
    const prev = value;

    // Optimistic update
    apiRef.current.updateRows([
      { id: id as UserRow['id'], [field]: next } as Partial<UserRow> & { id: UserRow['id'] },
    ]);

    // Persist
    void (async () => {
      const res = await fetch('/api/clients/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(id), role: next }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // Revert
        apiRef.current.updateRows([
          { id: id as UserRow['id'], [field]: prev } as Partial<UserRow> & { id: UserRow['id'] },
        ]);
        // İstersen window.dispatchEvent ile global toast tetikle:
        // window.dispatchEvent(new CustomEvent('app-toast', { detail: { msg: 'Rol güncellenemedi' } }));
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
      renderValue={(v) => (v ? String(v) : '---')}
    >
      {ROLE_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {opt}
        </MenuItem>
      ))}
    </Select>
  );
}

// Status için aynı mantık
type StatusSelectCellProps =
  GridRenderCellParams<UserRow, AppStatus | null> & { editable: boolean };

function StatusSelectCell(props: StatusSelectCellProps) {
  const { editable, id, field, value: rawValue } = props;
  const apiRef = useGridApiContext();
  const value = rawValue ?? ('' as unknown as AppStatus);

  // StatusSelectCell
  const handleChange = (e: SelectChangeEvent<AppStatus>) => {
    if (!editable) return;
    const next = e.target.value as AppStatus;
    const prev = value;

    apiRef.current.updateRows([
      { id: id as UserRow['id'], [field]: next } as Partial<UserRow> & { id: UserRow['id'] },
    ]);

    void (async () => {
      const res = await fetch('/api/clients/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(id), status: next }),
      }).catch(() => null);

      if (!res || !res.ok) {
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
      renderValue={(v) => (v ? String(v) : '---')}
    >
      {STATUS_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {opt}
        </MenuItem>
      ))}
    </Select>
  );
}

export function buildColumns( { editableRole, editableStatus }: { editableRole?: boolean; editableStatus?: boolean } = {} ): GridColDef<UserRow>[] {

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
    {
      field: 'role',
      headerName: 'Rol',
      flex: 1,
      minWidth: 160,
      align: 'left',        // ← hücre içeriği sola
      headerAlign: 'left',  // ← başlık sola
      cellClassName: 'col-role-left',
      // Edit modunu tamamen kullanmıyoruz, hep Select gösteriyoruz
      editable: false,
      type: 'singleSelect',
      valueOptions: [...ROLE_OPTIONS],
      renderCell: (params) => (
        <RoleSelectCell {...params} editable={!!editableRole} />
      ),
      // Sabit sıralama
      sortComparator: (a, b) =>
        ROLE_OPTIONS.indexOf((a ?? 'User') as AppRole) -
        ROLE_OPTIONS.indexOf((b ?? 'User') as AppRole),
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
      valueOptions: [...STATUS_OPTIONS],
      renderCell: (params: GridRenderCellParams<UserRow, AppStatus | null>) => (
        <StatusSelectCell {...params} editable={!!editableStatus} />
      ),
      sortComparator: (a, b) =>
        STATUS_OPTIONS.indexOf((a ?? 'Active') as AppStatus) -
        STATUS_OPTIONS.indexOf((b ?? 'Active') as AppStatus),
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