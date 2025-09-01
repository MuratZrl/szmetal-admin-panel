'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export interface Step3ClientProps<
  TSummaryRow extends Record<string, unknown> = Record<string, unknown>,
  TMaterialRow extends Record<string, unknown> = Record<string, unknown>
> {
  slug: string;
  form: Record<string, unknown> | null;
  /** Özet satır verileri (server tarafından hesaplanmış) */
  summary: TSummaryRow[];
  /** Malzeme satır verileri */
  materials: TMaterialRow[];
  /** DataGrid için kolon tanımları — server tarafında hazırlayın ve gönderin */
  summaryColumns: GridColDef[];
  materialColumns: GridColDef[];
  /** Opsiyonel: success sonrası yönlendirilecek yol (default /systems) */
  successRedirect?: string;
}

/**
 * Tipli, MUI + DataGrid kullanan client component.
 * - `any` yok.
 * - getRowId, id alanı yoksa fallback string üretir.
 */
export default function Step3Client<
  TSummaryRow extends Record<string, unknown>,
  TMaterialRow extends Record<string, unknown>
>(props: Step3ClientProps<TSummaryRow, TMaterialRow>) {
  const {
    slug,
    form,
    summary,
    materials,
    summaryColumns,
    materialColumns,
    successRedirect = '/systems',
  } = props;

  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });

  const getRowId = (row: Record<string, unknown>, fallbackIndex?: number) => {
    const idCandidate = (row as Record<string, unknown>).id ?? (row as Record<string, unknown>).ID ?? (row as Record<string, unknown>).key;
    if (typeof idCandidate === 'string' || typeof idCandidate === 'number') return String(idCandidate);
    // fallback: use combination of values (stable-ish)
    if (fallbackIndex !== undefined) return `r-${fallbackIndex}`;
    try {
      // safe stringify limited to first-level keys
      const entries = Object.entries(row).slice(0, 6).map(([k, v]) => `${k}:${String(v)}`).join('|');
      return `${String(entries).slice(0, 80)}`;
    } catch {
      return Math.random().toString(36).slice(2, 9);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, form, summary, materials }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Sunucu hatası: ${res.status}`);
      }

      setSnackbar({ open: true, severity: 'success', message: 'Talep başarıyla oluşturuldu.' });
      setTimeout(() => {
        router.push(successRedirect);
      }, 900);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setSnackbar({ open: true, severity: 'error', message: msg });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: { xs: 1.5, md: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Talep Özeti
      </Typography>

      <Paper variant="outlined" sx={{ mb: 3, p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Genel Bilgiler
        </Typography>

        <Box sx={{ height: 360, width: '100%' }}>
          <DataGrid
            rows={summary.map((r, idx) => ({ ...r, __localId: getRowId(r as Record<string, unknown>, idx) }))}
            columns={summaryColumns}
            getRowId={(r) => (r).__localId} // only for internal use to map to added __localId
            autoHeight
          />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ mb: 3, p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Malzeme Listesi
        </Typography>

        <Box sx={{ height: 420, width: '100%' }}>
          <DataGrid
            rows={materials.map((r, idx) => ({ ...r, __localId: getRowId(r as Record<string, unknown>, idx) }))}
            columns={materialColumns}
            getRowId={(r) => (r).__localId}
            autoHeight
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="outlined" color="inherit" onClick={() => router.push(`/systems/${slug}/step2`)} disabled={submitting}>
          Geri
        </Button>

        <Button variant="contained" color="primary" onClick={() => setConfirmOpen(true)} disabled={submitting}>
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Onayla'}
        </Button>
      </Box>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Talebi Onayla</DialogTitle>
        <DialogContent>
          <DialogContentText>Bu talebi göndermek istiyor musunuz? İşlem geri alınamaz.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
            İptal
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="primary" disabled={submitting}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Evet, Onayla'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
