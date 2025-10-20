// src/features/clients/components/columns.tsx
'use client';

import * as React from 'react';

import { Box, Avatar, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

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
/* Yardımcılar                                                                 */
/* -------------------------------------------------------------------------- */

function fallbackText(value: string | null | undefined): string {
  const s = value == null ? '' : String(value).trim();
  return s.length > 0 ? s : '---';
}

/** Tarihi TR yereliyle okunur biçimde formatla */
function formatDateTimeTR(iso: string | null | undefined): string {
  if (!iso) return '---';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '---';
  return new Date(t).toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Readonly görünüm için Select'e uygulanacak stil:
 * - Disabled grileşmesini kaldır
 * - Pointer etkileşimini kapat
 * - Çerçeveyi normal tut
 */
const READONLY_SELECT_SX = {
  '& .MuiSelect-select.Mui-disabled': { WebkitTextFillColor: 'inherit' },
  '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
  '&.Mui-disabled': { opacity: 1 },
  pointerEvents: 'none' as const,
  cursor: 'default',
};

/** DataGrid satırını kontrol eden patch callback'leri (TableGrid’den gelir) */
type PatchFns = {
  patchRow?: (id: string, patch: Partial<UserRow>) => void;
  restoreRow?: (snapshot: UserRow) => void;
  removeRow?: (id: string) => void;
};

/* -------------------------------------------------------------------------- */
/* Role Select Cell                                                            */
/* -------------------------------------------------------------------------- */

type RoleSelectCellProps =
  GridRenderCellParams<UserRow, AppRole | null> & { editable: boolean } & PatchFns;

function RoleSelectCell(props: RoleSelectCellProps) {
  const { editable, id, field, value: rawValue, row, patchRow, restoreRow } = props;
  const value = (rawValue ?? '') as AppRole | '';

  const handleChange = (e: SelectChangeEvent<AppRole>) => {
    if (!editable) return;
    const next = e.target.value as AppRole;

    // optimistic → lokal tablo state’ini güncelle
    const snapshot: UserRow = { ...row };
    patchRow?.(String(id), { [field]: next } as Partial<UserRow>);

    // persist
    void (async () => {
      // DİKKAT: sende role endpoint'i /api/clients/role (dosya: app/api/clients/role/route.ts)
      const res = await fetch('/api/clients/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(id), role: next }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // Hata → geri al
        restoreRow?.(snapshot);
      }
    })();
  };

  const readOnly = !editable;

  return (
    <Select
      value={value}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      size="small"
      fullWidth
      variant="outlined"
      displayEmpty
      disabled={readOnly}
      aria-readonly={readOnly}
      renderValue={(v) => (v ? ROLE_LABELS_TR[v as AppRole] : '---')}
      sx={readOnly ? READONLY_SELECT_SX : undefined}
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
  GridRenderCellParams<UserRow, AppStatus | null> & { editable: boolean } & PatchFns;

function StatusSelectCell(props: StatusSelectCellProps) {
  const { editable, id, field, value: rawValue, row, patchRow, restoreRow } = props;
  const value = (rawValue ?? '') as AppStatus | '';

  const handleChange = (e: SelectChangeEvent<AppStatus>) => {
    if (!editable) return;
    const next = e.target.value as AppStatus;

    // optimistic → lokal tablo state’ini güncelle
    const snapshot: UserRow = { ...row };
    patchRow?.(String(id), { [field]: next } as Partial<UserRow>);

    // persist
    void (async () => {
      const res = await fetch('/api/clients/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(id), status: next }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // Hata → geri al
        restoreRow?.(snapshot);
      }
    })();
  };

  const readOnly = !editable;

  return (
    <Select
      value={value}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      size="small"
      fullWidth
      variant="outlined"
      displayEmpty
      disabled={readOnly}
      aria-readonly={readOnly}
      renderValue={(v) => (v ? STATUS_LABELS_TR[v as AppStatus] : '---')}
      sx={readOnly ? READONLY_SELECT_SX : undefined}
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
/* Delete Cell                                                                 */
/* -------------------------------------------------------------------------- */

type DeleteCellProps =
  GridRenderCellParams<UserRow, null> & { canDelete: boolean } & PatchFns;

function DeleteCell(props: DeleteCellProps) {
  const { id, row, canDelete, removeRow, restoreRow } = props;

  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const { show } = useSnackbar();
  const name = row.username || row.email || 'kullanıcı';

  const openDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDelete) return;
    setOpen(true);
  };

  const handleClose = () => {
    if (busy) return;
    setOpen(false);
  };

  const handleConfirm = async () => {
    if (!canDelete) return;
    setBusy(true);

    // 1) Optimistic: satırı kaldır
    const snapshot: UserRow = { ...row };
    removeRow?.(String(id));

    // 2) Persist
    let ok = false;
    try {
      const res = await fetch('/api/clients/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(id) }),
      });
      ok = res.ok;
      if (!ok) {
        const j = (await res.json().catch(() => null)) as { error?: string; details?: string } | null;
        const msg = j?.error || j?.details || 'Silme başarısız.';
        throw new Error(msg);
      }
    } catch (err) {
      // 3) Revert + snackbar
      restoreRow?.(snapshot);
      show(err instanceof Error ? `Silinemedi: ${err.message}` : 'Silinemedi.', 'error');
      setBusy(false);
      setOpen(false);
      return;
    }

    // 4) Snackbar success
    show(`"${name}" silindi.`, 'success');
    setBusy(false);
    setOpen(false);
  };

  return (
    <>
      <Tooltip title={canDelete ? 'Sil' : 'Yetki yok'}>
        <span>
          <IconButton aria-label="Sil" size="small" onClick={openDialog} disabled={!canDelete}>
            <DeleteOutlineIcon />
          </IconButton>
        </span>
      </Tooltip>

      <ConfirmDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Kullanıcıyı sil"
        description={`"${name}" kaydını silmek istediğine emin misin? Bu işlem geri alınamaz.`}
        confirmText={busy ? 'Siliniyor...' : 'Evet, sil'}
        cancelText="Vazgeç"
        confirmColor="error"
        confirmDisabled={busy}
        disableClose={busy}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Kolonlar                                                                    */
/* -------------------------------------------------------------------------- */

export function buildColumns(
  {
    canEditRole,
    canEditStatus,
    canDeleteUser,
    selfUserId,
    patchRow,
    restoreRow,
    removeRow,
  }: {
    canEditRole?: (row: UserRow) => boolean;
    canEditStatus?: (row: UserRow) => boolean;
    canDeleteUser?: (row: UserRow) => boolean;
    selfUserId?: string | null;
  } & PatchFns = {}
): GridColDef<UserRow>[] {
  const cols: GridColDef<UserRow>[] = [
    {
      field: 'image',
      headerName: 'Görsel',
      width: 80,
      sortable: false,
      filterable: false,
      editable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) => {
        const src = params.value ?? undefined;
        const name = params.row.username ?? params.row.email;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 1 }}>
            <Avatar src={src ?? undefined} alt={name ?? 'user'} />
          </Box>
        );
      },
    },
    {
      field: 'username',
      headerName: 'Kullanıcı Adı',
      flex: 1,
      minWidth: 140,
      disableColumnMenu: true,
      editable: false,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },
    {
      field: 'email',
      headerName: 'E-posta',
      flex: 1.2,
      minWidth: 180,
      editable: false,
      disableColumnMenu: true,
      resizable: false,
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
      disableColumnMenu: true,
      resizable: false,
      type: 'singleSelect',
      valueOptions: ROLE_OPTIONS.map((v) => ({ value: v, label: ROLE_LABELS_TR[v] })),
      renderCell: (p) => (
        <RoleSelectCell
          {...p}
          editable={canEditRole ? canEditRole(p.row) : false}
          patchRow={patchRow}
          restoreRow={restoreRow}
        />
      ),
      sortComparator: (a, b) =>
        ROLE_OPTIONS.indexOf((a ?? 'User') as AppRole) -
        ROLE_OPTIONS.indexOf((b ?? 'User') as AppRole),
      valueFormatter: (value) => (value ? ROLE_LABELS_TR[value as AppRole] : '---'),
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
      type: 'singleSelect',
      editable: false,
      resizable: false,
      disableColumnMenu: true,
      valueOptions: STATUS_OPTIONS.map((v) => ({ value: v, label: STATUS_LABELS_TR[v] })),
      renderCell: (p: GridRenderCellParams<UserRow, AppStatus | null>) => (
        <StatusSelectCell
          {...p}
          editable={canEditStatus ? canEditStatus(p.row) : false}
          patchRow={patchRow}
          restoreRow={restoreRow}
        />
      ),
      sortComparator: (a, b) =>
        STATUS_OPTIONS.indexOf((a ?? 'Active') as AppStatus) -
        STATUS_OPTIONS.indexOf((b ?? 'Active') as AppStatus),
      valueFormatter: (value) => (value ? STATUS_LABELS_TR[value as AppStatus] : '---'),
    },

    {
      field: 'company',
      headerName: 'Şirket',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },

    {
      field: 'phone',
      headerName: 'Telefon',
      flex: 1,
      minWidth: 150,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },

    {
      field: 'country',
      headerName: 'Ülke',
      flex: 0.8,
      minWidth: 120,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        fallbackText(params.value),
    },

    /* --- Katılma Tarihi --- */
    {
      field: 'created_at',
      headerName: 'Katılma Tarihi',
      flex: 1,
      minWidth: 180,
      editable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<UserRow, string | null>) =>
        formatDateTimeTR(params.value ?? null),
      sortComparator: (a: unknown, b: unknown): number => {
        const ta = typeof a === 'string' ? Date.parse(a) : Number.NaN;
        const tb = typeof b === 'string' ? Date.parse(b) : Number.NaN;
        const ax = Number.isFinite(ta) ? ta : Number.NEGATIVE_INFINITY;
        const bx = Number.isFinite(tb) ? tb : Number.NEGATIVE_INFINITY;
        return ax - bx;
      },
    },

    /* --- Silme Sütunu (en son sütun) --- */
    {
      field: '__delete__',
      headerName: 'Sil',
      width: 90,
      sortable: false,
      filterable: false,
      editable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => {
        // KENDİ SATIRIN: buton hiç görünmesin, boş kalsın
        const isSelf = selfUserId ? p.row.id === selfUserId : false;
        if (isSelf) {
          return <Box component="span" sx={{ display: 'inline-block', width: 24, height: 24 }} />;
        }
        const canDelete = canDeleteUser ? canDeleteUser(p.row) : false;
        return (
          <DeleteCell
            {...p}
            value={null}
            canDelete={canDelete}
            removeRow={removeRow}
            restoreRow={restoreRow}
          />
        );
      },
    },
  ];

  return cols;
}
