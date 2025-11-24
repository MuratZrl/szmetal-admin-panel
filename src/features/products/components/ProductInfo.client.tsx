// src/features/products/components/ProductInfo.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  Paper,
  Stack,
  Chip,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { darken } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';

import { detectMediaKind } from '@/features/products/utils/media';

type Maybe<T> = T | null | undefined;

export type LabelMaps = {
  category?: Record<string, string>;
  subCategory?: Record<string, string>;
  variant?: Record<string, string>;
};

export type ProductInfoProps = {
  title: string;
  variant: string;
  category: string;
  subCategory?: string;
  date: string;
  /** EKLENDİ: Revizyon tarihi */
  revisionDate?: string | null;
  id: string;

  /** EKLE: ürün kodu (insan okur) */
  code?: string | null;

  hasCustomerMold?: boolean | null;
  has_customer_mold?: boolean | null;

  availability?: boolean | null;

  drawer?: Maybe<string>;
  control?: Maybe<string>;
  unit_weight_g_pm?: number;
  scale?: Maybe<string>;
  outerSizeMm?: Maybe<number>;
  sectionMm2?: Maybe<number>;
  tempCode?: Maybe<string>;
  profileCode?: Maybe<string>;
  manufacturerCode?: Maybe<string>;

  labels?: LabelMaps;
  footerSlot?: React.ReactNode;

  /** Medya eylemleri için URL’ler */
  mediaSrc?: string | null;
  mediaFileUrl?: string | null;
  mediaExt?: 'pdf' | 'png' | 'webp' | 'jpg' | 'jpeg' | null;
  mediaMime?: string | null;

  children?: React.ReactNode;

  description?: string | null;
};

// Basit label-value türü
type DetailItem = { label: string; value: React.ReactNode };

/** Ortak yüzey rengi: tüm gövde hücreleri ve kutu zeminleri */
const surfaceBg = (t: Theme): string =>
  t.palette.mode === 'dark' ? t.palette.background.default : t.palette.background.paper;

/** Bölüm başlığı için koyu zemin: yüzeyden türetip koyulaştır */
const sectionHeaderBg = (t: Theme): string =>
  darken(surfaceBg(t), t.palette.mode === 'dark' ? 0.32 : 0.08);

// 1) 2 sütunlu tablo (her satırda 2 label-değer çifti)
function DetailsTable({ rows }: { rows: Array<[DetailItem, DetailItem | null]> }) {
  return (
    <Box 
      sx={{ 
        border: 1, 
        borderColor: 'divider', 
        borderRadius: 0.5, 
        overflow: 'hidden' 
      }}
    >
      <Table
        size="small"
        sx={{
          tableLayout: 'fixed',
          // Gövde hücrelerinin zemini
          '& .MuiTableCell-root': (t) => ({
            borderBottom: 0,
            bgcolor: surfaceBg(t),
          }),
          // Thead’i koyu yap
          '& .MuiTableHead-root .MuiTableCell-root': (t) => ({
            bgcolor: sectionHeaderBg(t),
          }),
          '& .MuiTableBody-root .MuiTableRow-root:not(:last-of-type) .MuiTableCell-root': (t) => ({
            borderBottom: `1px solid ${t.palette.divider}`,
          }),
          '& td, & th': { px: 2 },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              component="th"
              scope="colgroup"
              colSpan={4}
              sx={{ fontWeight: 700, px: 1.5, color: 'text.primary' }}
            >
              <Typography variant="subtitle2" component="span">
                Özellikler
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map(([a, b], idx) => {
            const boldLeftValue = typeof a.label === 'string' && a.label.startsWith('Birim Ağırlık');
            const boldRightValue = !!b && typeof b.label === 'string' && b.label.startsWith('Birim Ağırlık');

            return (
              <TableRow key={idx}>
                
                {/* Sol etiket */}
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ width: { xs: '30%', sm: '22%' }, color: 'text.secondary', whiteSpace: 'nowrap' }}
                >
                  {a.label}
                </TableCell>

                {/* Sol değer (gerekirse bold) */}
                <TableCell sx={{ pr: { sm: 2 }, fontWeight: boldLeftValue ? 700 : undefined }}>
                  {a.value}
                </TableCell>

                {b ? (
                  <>
                    {/* Sağ etiket */}
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ width: { xs: '30%', sm: '22%' }, color: 'text.secondary', whiteSpace: 'nowrap' }}
                    >
                      {b.label}
                    </TableCell>

                    {/* Sağ değer (gerekirse bold) */}
                    <TableCell sx={{ fontWeight: boldRightValue ? 700 : undefined }}>
                      {b.value}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ width: { xs: '30%', sm: '22%' } }} />
                    <TableCell />
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

// 2) Açıklama Kısmı - Balon yerine düz chip
function NoteChip({ children }: { children: React.ReactNode }) {
  return (
    <Chip
      variant="filled"
      label={
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
          {children}
        </Typography>
      }
      sx={(t) => ({
        alignSelf: 'flex-start',
        maxWidth: { xs: '100%', sm: '85%' },
        height: 'auto',
        '& .MuiChip-label': {
          display: 'block',
          py: 2,
          px: 2.5,
          whiteSpace: 'normal',
        },
        bgcolor: surfaceBg(t), // kutu zeminiyle aynı
      })}
    />
  );
}

// 3) Açıklama Kısmı - Not kutusu içinde NoteChip kullan
function NotesMessageBox({ text }: { text?: string | null }) {
  const raw = typeof text === 'string' ? text : '';
  const lines = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <Box
      sx={(t) => ({
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0.5,
        bgcolor: surfaceBg(t), // kutunun zemini
      })}
    >
      {/* Koyu başlık şeridi */}
      <Box
        sx={(t) => ({
          bgcolor: sectionHeaderBg(t),
          borderRadius: 0.5,
          px: 2,
          py: 1.75,
          mb: 0,
        })}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }} color="text.primary">
          Ek Notlar
        </Typography>
      </Box>

      {/* İçerik */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxHeight: 280,
          overflow: 'auto',
        }}
      >
        {lines.length ? lines.map((t, i) => <NoteChip key={i}>{t}</NoteChip>) : <NoteChip>Yok</NoteChip>}
      </Box>
    </Box>
  );
}

export default function ProductInfo(props: ProductInfoProps) {
  const {
    title,
    variant,
    category,
    subCategory,
    unit_weight_g_pm,
    date,
    revisionDate,
    drawer,
    control,
    scale,
    outerSizeMm,
    sectionMm2,
    tempCode,
    manufacturerCode,
    labels,
    hasCustomerMold,
    has_customer_mold,
    availability,
    mediaSrc,
    mediaFileUrl,
    mediaExt,
    mediaMime,
    description,
    children,
  } = props;

  const fmt0 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const nf = (n?: number | null) => (typeof n === 'number' ? fmt0.format(n) : undefined);

  const mold =
    typeof hasCustomerMold === 'boolean'
      ? hasCustomerMold
      : typeof has_customer_mold === 'boolean'
      ? has_customer_mold
      : null;

  const moldChip =
    typeof mold === 'boolean' ? (
      <Chip size="small" label={mold ? 'Evet' : 'Hayır'} variant="outlined" sx={{ fontWeight: 600 }} />
    ) : null;

  const avail = typeof availability === 'boolean' ? availability : null;

  const usageNode: React.ReactNode =
    avail === null
      ? undefined
      : avail
      ? (
          <Typography component="span" sx={{ color: 'success.main', fontWeight: 500 }}>
            Kullanılabilir
          </Typography>
        )
      : 'Kullanılamaz';

  const variantText = labels?.variant?.[variant] ?? variant;
  const catText = category ? labels?.category?.[category] ?? category : '';
  const subText = subCategory ? labels?.subCategory?.[subCategory] ?? subCategory : '';

  // --- Medya URL seçimi ve güvenli linkler ---
  const srcUrl = (mediaSrc ?? '').trim();
  const fbUrl = (mediaFileUrl ?? '').trim();

  const srcKind = srcUrl
    ? detectMediaKind({ url: srcUrl, mime: mediaMime ?? undefined, extHint: mediaExt ?? undefined })
    : 'unknown';
  const fbKind = fbUrl
    ? detectMediaKind({ url: fbUrl, mime: mediaMime ?? undefined, extHint: mediaExt ?? undefined })
    : 'unknown';

  const chosen:
    | { url: string; kind: string }
    | { url: ''; kind: 'unknown' } =
    (srcUrl && srcKind !== 'unknown' && { url: srcUrl, kind: srcKind }) ||
    (fbUrl && fbKind !== 'unknown' && { url: fbUrl, kind: fbKind }) || { url: '', kind: 'unknown' as const };

  const anyUrl = srcUrl || fbUrl;

  function withQuery(u: string, q: Record<string, string>): string {
    const url = new URL(u, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    Object.entries(q).forEach(([k, v]) => url.searchParams.set(k, v));
    const rel = url.pathname + (url.search ? url.search : '');
    return u.startsWith('/') ? rel : url.toString();
  }

  const isSecureRoute = (u: string) => u.startsWith('/api/products/storage');

  const base = (chosen.url || anyUrl) as string;

  const safeExt = mediaExt ?? 'pdf';
  const filename = `${title.replace(/\s+/g, '-').replace(/[^\w.-]/g, '')}.${safeExt}`;
  const downloadHref =
    base && isSecureRoute(base) ? withQuery(base, { disposition: 'attachment', filename }) : base;

  // Yardımcılar
  const safe = (v: React.ReactNode): React.ReactNode => (v === undefined || v === null || v === '' ? '—' : v);
  const make = (label: string, value: React.ReactNode): DetailItem => ({ label, value });

  const rows: Array<[DetailItem, DetailItem | null]> = [];

  // İSTENEN SIRALAMA
  rows.push([make('Kategori:', safe(catText)), make('Alt Kategori:', safe(subText))]);
  rows.push([make('Varyant:', safe(variantText)), make('Birim Ağırlık (gr/m):', safe(nf(unit_weight_g_pm)))]);
  rows.push([make('Kullanım Durumu:', safe(usageNode)), make('Müşteri Kalıbı:', safe(moldChip))]);
  
  // Tarih ve Revizyon Tarihi aynı satırda
  rows.push([make('Yapıldığı Tarih:', safe(date)), make('Revizyon Tarihi:', safe(revisionDate))]);

  rows.push([make('Çizen:', safe(drawer)), make('Kontrol:', safe(control))]);


  const tail: DetailItem[] = [];
  if (tempCode) tail.push(make('Geçici Kod:', tempCode));
  if (manufacturerCode) tail.push(make('Üretici Kodu:', manufacturerCode));
  if (scale) tail.push(make('Ölçek:', scale));
  if (typeof outerSizeMm === 'number') tail.push(make('Dış Çevre (mm):', nf(outerSizeMm)!));
  if (typeof sectionMm2 === 'number') tail.push(make('Kesit (mm²):', nf(sectionMm2)!));

  for (let i = 0; i < tail.length; i += 2) {
    const left = tail[i]!;
    const right = tail[i + 1] ?? null;
    rows.push([left, right]);
  }

  const showMediaActions = Boolean(base);

  // ------- Yazdır helper'ı -------
  function handlePrint() {
    const code = (props as { code?: string | null }).code ?? '';
    if (!code) return; // ya button'u disabled yap ya da buradan dön
    const w = window.open(`/products/${encodeURIComponent(code)}/print`, '_blank', 'noopener,noreferrer');
    w?.focus();
  }

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 0.5, bgcolor: 'background.default' }}>
      <Paper variant="outlined" elevation={0} sx={{ p: 1.5, borderRadius: 0, bgcolor: 'background.paper' }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            {/* Başlık */}
            {title ? (
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, m: 0, p: 0 }}>
                {title}
              </Typography>
            ) : null}

            {/* Medya aksiyonları */}
            {showMediaActions ? (
              <Stack direction="row" spacing={0.5}>
                <IconButton LinkComponent={Link} href={downloadHref} aria-label="İndir" size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={handlePrint}
                  aria-label="Yazdır"
                  size="small"
                  disabled={!('code' in props) || !props.code}
                  title={!props.code ? 'Bu ürünün code alanı boş' : 'Yazdır'}
                >
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : null}
          </Box>

          {/* 2 sütunlu tablo görünümü */}
          <DetailsTable rows={rows} />

          {/* Notlar (chip kutusu görünümü) — HER ZAMAN GÖRÜNÜR, boşsa “Yok” */}
          {/* <NotesMessageBox text={description} /> */}

          {children ? <Box sx={{ pt: 1 }}>{children}</Box> : null}
        </Stack>
      </Paper>
    </Paper>
  );
}
