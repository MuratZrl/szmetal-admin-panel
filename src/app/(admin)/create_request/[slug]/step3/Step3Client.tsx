// app/(admin)/create_request/[slug]/step3/Step3Client.tsx
'use client';

import React, { useMemo, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// ↓ PRINT BLOĞU
import Step3PrintBlock, {
  type KvRow,
  type PrintMaterial
} from '@/features/create_request/print/Step3PrintBlock.client';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { giyotinGenelBilgiColumns, giyotinMalzemeColumns } from '@/features/create_request/constants/columns/giyotin-sistemi';
import type { GiyotinProfilHesapli } from '@/features/create_request/types/system';

export interface Step3ClientProps<
  TSummaryRow extends Record<string, unknown> = Record<string, unknown>,
  TMaterialRow extends Record<string, unknown> = Record<string, unknown>
> {
  slug: string;
  form: Record<string, unknown> | null;
  summary: TSummaryRow[];
  materials: TMaterialRow[];
  successRedirect?: Route;
}

function autoColumns(rows: Array<Record<string, unknown>>): GridColDef[] {
  if (!rows?.length) return [];
  return Object.keys(rows[0])
    .filter(k => k !== '__localId')
    .map((field) => ({
      field,
      headerName: field.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase()),
      flex: 1,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
    }));
}

export default function Step3Client<
  TSummaryRow extends Record<string, unknown>,
  TMaterialRow extends Record<string, unknown>
>({ slug, form, summary, materials, successRedirect = '/create_request' }: Step3ClientProps<TSummaryRow, TMaterialRow>) {
  const router = useRouter();
  const { show } = useSnackbar();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const summaryColumns = useMemo<GridColDef[]>(() => {
    if (slug === 'giyotin-sistemi') return giyotinGenelBilgiColumns;
    return autoColumns(summary as Record<string, unknown>[]);
  }, [slug, summary]);

  const materialColumns = useMemo<GridColDef[]>(() => {
    if (slug === 'giyotin-sistemi') return giyotinMalzemeColumns;
    return autoColumns(materials as Record<string, unknown>[]);
  }, [slug, materials]);

  const getRowId = (row: Record<string, unknown>, fallbackIndex?: number) => {
    const idCandidate = (row).id ?? (row).ID ?? (row).key;
    if (typeof idCandidate === 'string' || typeof idCandidate === 'number') return String(idCandidate);
    if (fallbackIndex !== undefined) return `r-${fallbackIndex}`;
    try {
      const entries = Object.entries(row).slice(0, 6).map(([k, v]) => `${k}:${String(v)}`).join('|');
      return `${String(entries).slice(0, 80)}`;
    } catch {
      return Math.random().toString(36).slice(2, 9);
    }
  };

  // 1) ÖZETİ KV'ye çevir (any yok)
  const summaryKv: KvRow[] = useMemo(() => {
    const rows = summary as Array<Record<string, unknown>>;
    const out: KvRow[] = [];
    rows.forEach(obj => {
      Object.entries(obj).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        out.push({
          label: k.replace(/_/g, ' '),
          value: typeof v === 'number' ? v : String(v),
        });
      });
    });
    return out;
  }, [summary]);

  // 2) MALZEMELERİ yazdırma tipine indir
  const printMaterials = useMemo<PrintMaterial[]>(() => {
    if (slug === 'giyotin-sistemi') {
      const arr = materials as unknown as GiyotinProfilHesapli[];
      return arr.map(m => ({
        profil_resmi: m.profil_resmi ?? null,
        profil_kodu: m.profil_kodu,
        profil_adi: m.profil_adi,
        kesim_olcusu: m.kesim_olcusu,
        verilecek_adet: m.verilecek_adet,
      }));
    }
    
    const rows = materials as Array<Record<string, unknown>>;

    return rows.map(m => ({
      profil_resmi: typeof m.profil_resmi === 'string' ? m.profil_resmi : null,
      profil_kodu: String(m.profil_kodu ?? ''),
      profil_adi: String(m.profil_adi ?? ''),
      kesim_olcusu: String(m.kesim_olcusu ?? ''),
      verilecek_adet:
        typeof m.verilecek_adet === 'number' || typeof m.verilecek_adet === 'string'
          ? m.verilecek_adet
          : '',
    }));

  }, [materials, slug]);

  const handleConfirm = async () => {
    
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, form, summary, materials }),
      });
    
      const body = await res.json().catch(() => ({} as Record<string, unknown>));
    
      if (!res.ok) {
        if (body?.error === 'VALIDATION_FAILED' && Array.isArray(body.details)) {
          const msg = body.details.map((d: { path?: string; message?: string }) =>
            `${d.path ?? '-'}: ${d.message ?? ''}`).join('\n');
          throw new Error(msg);
        }
        throw new Error(body?.error ?? `Sunucu hatası: ${res.status}`);
      }
    
      show('Talep başarıyla oluşturuldu.', 'success');
      setTimeout(() => router.push(successRedirect), 900);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      show(msg, 'error');
    
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: { xs: 1.5, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Typography variant="h6">Talep Özeti</Typography>

        {/* ARTIK ROUTE’A GİTMİYORUZ */}
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Yazdır
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ mb: 3, p: 1 }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, p: 1 }}>
            Genel Bilgiler
          </Typography>
          <DataGrid
            rows={summary.map((r, idx) => ({ ...r, __localId: getRowId(r as Record<string, unknown>, idx) }))}
            columns={summaryColumns}
            getRowId={(r) => (r).__localId}
            autoHeight
            hideFooter
          />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ mb: 3, p: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, p: 1}}>
          Malzeme Listesi
        </Typography>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={materials.map((r, idx) => ({ ...r, __localId: getRowId(r as Record<string, unknown>, idx) }))}
            columns={materialColumns}
            getRowId={(r) => (r).__localId}
            rowHeight={115}
            autoHeight
            hideFooter
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push(`/create_request/${slug}/step2`)}
          disabled={submitting}
        >
          Geri
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setConfirmOpen(true)}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Onayla'}
        </Button>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Talebi Onayla"
        description="Bu talebi göndermek istiyor musunuz? İşlem geri alınamaz."
        confirmText={submitting ? 'Gönderiliyor...' : 'Evet, Onayla'}
        cancelText="İptal"
      />

      {/* SADECE YAZDIRMADA GÖRÜNEN ŞABLON */}
      <Step3PrintBlock
        title={`Talep — ${slug}`}
        summaryRows={summaryKv}
        materials={printMaterials}
        columns={3}
        showDate
      />

    </Box>
  );
}
