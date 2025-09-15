'use client';

import * as React from 'react';
import {
  Paper, Typography, Divider, Stack, Button, Chip, Box, CircularProgress,
} from '@mui/material';
import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

type Props = {
  requestId: string;
  status: RequestStatus;
  onStatusChange?: (next: RequestStatus) => void; // opsiyonel: sayfayı eşzamanlı güncellemek istersen
};

function statusChipColor(s: RequestStatus):
  'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' {
  switch (s) {
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default:         return 'warning';
  }
}

// üst kısma ekle
function statusTextTR(s: RequestStatus): string {
  switch (s) {
    case 'approved': return 'Onaylandı';
    case 'rejected': return 'Reddedildi';
    default:         return 'Bekleyen';
  }
}

export default function StatusCard({ requestId, status, onStatusChange }: Props) {
  const { show } = useSnackbar();

  const [current, setCurrent] = React.useState<RequestStatus>(status);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
  const [nextStatus, setNextStatus] = React.useState<RequestStatus>('pending');

  const openConfirm = (s: RequestStatus) => {
    setNextStatus(s);
    setConfirmOpen(true);
  };

  async function updateStatus(s: RequestStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(requestId)}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: s }),
      });

      const ok = res.ok;
      const json = (await res.json().catch(() => null)) as unknown;

      if (!ok) {
        const msg = typeof json === 'object' && json && 'error' in (json as Record<string, unknown>)
          ? String((json as Record<string, unknown>).error)
          : 'Durum güncellenemedi.';
        show(msg, 'error');
        return;
      }

      // başarılı
      setCurrent(s);
      onStatusChange?.(s);
      show(s === 'approved' ? 'Talep onaylandı.' : 'Talep reddedildi.', 'success');
    } catch {
      show('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Talep Durumu</Typography>
      <Divider sx={{ mb: 1 }} />

      {/* Tek satır: solda "Mevcut" + Chip, sağda butonlar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'nowrap', // tek satırda kalsın
          minHeight: 40,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
          Mevcut
        </Typography>

        <Chip
          size="small"
          label={statusTextTR(current)}   // ← PENDING yerine Bekleyen/Onaylandı/Reddedildi
          color={statusChipColor(current)}
          variant="outlined"
        />

        {/* Spacer yerine ml:auto da olur; ikisi de sağa iter */}
        <Stack direction="row" spacing={1} sx={{ ml: 'auto', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            disabled={loading || current === 'approved'}
            onClick={() => openConfirm('approved')}
            sx={{ borderRadius: 2, textTransform: 'capitalize' }}
          >
            {loading && nextStatus === 'approved' ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Onayla
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={loading || current === 'rejected'}
            onClick={() => openConfirm('rejected')}
            sx={{ borderRadius: 2, textTransform: 'capitalize' }}
          >
            {loading && nextStatus === 'rejected' ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Reddet
          </Button>
        </Stack>

      </Box>

      {/* Onay diyaloğu */}
      <ConfirmDialog
        open={confirmOpen}
        title={nextStatus === 'approved' ? 'Onayla' : 'Reddet'}
        description={
          nextStatus === 'approved'
            ? 'Bu talebi ONAYLAMAK istediğinize emin misiniz?'
            : 'Bu talebi REDDETMEK istediğinize emin misiniz?'
        }
        confirmText={nextStatus === 'approved' ? 'Evet, Onayla' : 'Evet, Reddet'}
        cancelText="Vazgeç"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void updateStatus(nextStatus);
        }}
      />
    </Paper>
  );
}
