// src/features/products/components/ProductInfo.client.tsx
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
  subSubCategory?: Record<string, string>; // ✅ eklendi
  variant?: Record<string, string>;
};

export type ProductInfoProps = {
  title: string;
  variant: string;
  category?: string | null;
  subCategory?: string | null;
  subSubCategory?: string | null; // ✅ eklendi (En Alt Kategori)
  date: string;
  revisionDate?: string | null;
  /** created_at sütunundan gelecek, Eklenme Tarihi için */
  createdAt?: string | null;
  id: string;
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
  mediaSrc?: string | null;
  mediaFileUrl?: string | null;
  mediaExt?: 'pdf' | 'png' | 'webp' | 'jpg' | 'jpeg' | null;
  mediaMime?: string | null;
  children?: React.ReactNode;
  description?: string | null;
};

type DetailItem = { label: string; value: React.ReactNode };

const surfaceBg = (t: Theme): string =>
  t.palette.mode === 'dark' ? t.palette.background.default : t.palette.background.paper;

const sectionHeaderBg = (t: Theme): string =>
  darken(surfaceBg(t), t.palette.mode === 'dark' ? 0.32 : 0.08);

// Tam sayı formatlayıcı (gr/m, mm, mm²)
const fmtInt = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: false, // <-- binlik ayraç yok, direkt 1202
});

const formatInt = (n?: number | null) =>
  typeof n === 'number' ? fmtInt.format(n) : undefined;

function DetailsTable({ rows }: { rows: Array<[DetailItem, DetailItem | null]> }) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 0.5,
        overflow: 'hidden',
      }}
    >
      <Table
        size="small"
        sx={{
          tableLayout: 'fixed',
          '& .MuiTableCell-root': (t) => ({
            borderBottom: 0,
            bgcolor: surfaceBg(t),
          }),
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
            const boldLeftValue =
              typeof a.label === 'string' && a.label.startsWith('Birim Ağırlık');
            const boldRightValue =
              !!b &&
              typeof b.label === 'string' &&
              b.label.startsWith('Birim Ağırlık');

            return (
              <TableRow key={idx}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    width: { xs: '30%', sm: '22%' },
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a.label}
                </TableCell>

                <TableCell
                  sx={{
                    pr: { sm: 2 },
                    fontWeight: boldLeftValue ? 700 : undefined,
                  }}
                >
                  {a.value}
                </TableCell>

                {b ? (
                  <>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        width: { xs: '30%', sm: '22%' },
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {b.label}
                    </TableCell>

                    <TableCell
                      sx={{ fontWeight: boldRightValue ? 700 : undefined }}
                    >
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

function NoteChip({ children }: { children: React.ReactNode }) {
  return (
    <Chip
      variant="filled"
      label={
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}
        >
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
        bgcolor: surfaceBg(t),
      })}
    />
  );
}

function NotesMessageBox({ text }: { text?: string | null }) {
  const raw = typeof text === 'string' ? text : '';
  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Box
      sx={(t) => ({
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0.5,
        bgcolor: surfaceBg(t),
      })}
    >
      <Box
        sx={(t) => ({
          bgcolor: sectionHeaderBg(t),
          borderRadius: 0.5,
          px: 2,
          py: 1.75,
          mb: 0,
        })}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 700 }}
          color="text.primary"
        >
          Ek Notlar
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxHeight: 280,
          overflow: 'auto',
        }}
      >
        {lines.length
          ? lines.map((t, i) => <NoteChip key={i}>{t}</NoteChip>)
          : <NoteChip>Yok</NoteChip>}
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
    subSubCategory,
    unit_weight_g_pm,
    date,
    revisionDate,
    createdAt,
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

  const mold =
    typeof hasCustomerMold === 'boolean'
      ? hasCustomerMold
      : typeof has_customer_mold === 'boolean'
      ? has_customer_mold
      : null;

  const moldChip =
    typeof mold === 'boolean' ? (
      <Chip
        size="small"
        label={mold ? 'Evet' : 'Hayır'}
        variant='outlined'
        color={mold ? 'warning' : 'default'}
        sx={(theme) => ({
          fontWeight: 700,
          letterSpacing: 0.3,
          ...(mold
            ? {
              bgcolor: theme.palette.contrast.contrastText,
              color: theme.palette.warning.main,
              }
            : {}),
        })}
      />
    ) : null;

  const avail = typeof availability === 'boolean' ? availability : null;

  const usageNode: React.ReactNode =
    avail === null
      ? undefined
      : avail
      ? (
          <Typography
            component="span"
            sx={{ color: 'success.main', fontWeight: 500 }}
          >
            Kullanılabilir
          </Typography>
        )
      : 'Kullanılamaz';

  const variantText = labels?.variant?.[variant] ?? variant;
  const catText = category ? labels?.category?.[category] ?? category : '';
  const subText = subCategory ? labels?.subCategory?.[subCategory] ?? subCategory : '';
  const leafText = subSubCategory
    ? labels?.subSubCategory?.[subSubCategory] ?? subSubCategory
    : '';

  // created_at genelde ISO datetime, sadece tarihi göstermek için ilk 10 karakteri alalım
  const createdDate =
    typeof createdAt === 'string' && createdAt
      ? createdAt.slice(0, 10)
      : '';

  const srcUrl = (mediaSrc ?? '').trim();
  const fbUrl = (mediaFileUrl ?? '').trim();

  const srcKind = srcUrl
    ? detectMediaKind({
        url: srcUrl,
        mime: mediaMime ?? undefined,
        extHint: mediaExt ?? undefined,
      })
    : 'unknown';

  const fbKind = fbUrl
    ? detectMediaKind({
        url: fbUrl,
        mime: mediaMime ?? undefined,
        extHint: mediaExt ?? undefined,
      })
    : 'unknown';

  const chosen:
    | { url: string; kind: string }
    | { url: ''; kind: 'unknown' } =
    (srcUrl &&
      srcKind !== 'unknown' && { url: srcUrl, kind: srcKind }) ||
    (fbUrl &&
      fbKind !== 'unknown' && { url: fbUrl, kind: fbKind }) || {
      url: '',
      kind: 'unknown' as const,
    };

  const anyUrl = srcUrl || fbUrl;

  function withQuery(u: string, q: Record<string, string>): string {
    const url = new URL(
      u,
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost',
    );
    Object.entries(q).forEach(([k, v]) => url.searchParams.set(k, v));
    const rel = url.pathname + (url.search ? url.search : '');
    return u.startsWith('/') ? rel : url.toString();
  }

  const isSecureRoute = (u: string) => u.startsWith('/api/products/storage');

  const base = (chosen.url || anyUrl) as string;

  const safeExt = mediaExt ?? 'pdf';
  const filename = `${title
    .replace(/\s+/g, '-')
    .replace(/[^\w.-]/g, '')}.${safeExt}`;
  const downloadHref =
    base && isSecureRoute(base)
      ? withQuery(base, { disposition: 'attachment', filename })
      : base;

  const safe = (v: React.ReactNode): React.ReactNode =>
    v === undefined || v === null || v === '' ? '—' : v;
  const make = (label: string, value: React.ReactNode): DetailItem => ({
    label,
    value,
  });

  const rows: Array<[DetailItem, DetailItem | null]> = [];

  rows.push([
    make('Kategori:', safe(catText)),
    make('Alt Kategori:', safe(subText)),
  ]);

  // ✅ İSTEDİĞİN SATIR: Varyant + En Alt Kategori yan yana
  rows.push([
    make('Varyant:', safe(variantText)),
    make('En Alt Kategori:', safe(leafText)),
  ]);

  // ✅ Birim ağırlık satırını aşağı kaydır (boşa düşmesin)
  rows.push([
    make('Birim Ağırlık (gr/m):', formatInt(unit_weight_g_pm)),
    make('Kullanım Durumu:', safe(usageNode)),
  ]);

  rows.push([
    make('Kullanım Durumu:', safe(usageNode)),
    make('Müşteri Kalıbı:', safe(moldChip)),
  ]);

  rows.push([
    make('Çizildiği Tarih:', safe(date)),
    make('Revizyon Tarihi:', safe(revisionDate)),
  ]);

  // Burada ekstra satır: Eklenme Tarihi (created_at)
  rows.push([
    make('Eklenme Tarihi:', safe(createdDate)),
    null,
  ]);

  rows.push([make('Çizen:', safe(drawer)), make('Kontrol:', safe(control))]);

  const tail: DetailItem[] = [];
  if (tempCode) tail.push(make('Geçici Kod:', tempCode));
  if (manufacturerCode) tail.push(make('Üretici Kodu:', manufacturerCode));
  if (scale) tail.push(make('Ölçek:', scale));
  if (typeof outerSizeMm === 'number') tail.push(make('Dış Çevre (mm):', formatInt(outerSizeMm)!));
  if (typeof sectionMm2 === 'number') tail.push(make('Kesit (mm²):', formatInt(sectionMm2)!));

  for (let i = 0; i < tail.length; i += 2) {
    const left = tail[i]!;
    const right = tail[i + 1] ?? null;
    rows.push([left, right]);
  }

  const showMediaActions = Boolean(base);

  function getPrintUrl(): string | null {
    if (!base) return null;

    // Yazdırırken dosyanın inline açılmasını istiyoruz
    const url = isSecureRoute(base)
      ? withQuery(base, { disposition: 'inline' })
      : base;

    return url || null;
  }

  function handlePrint() {
    if (typeof window === 'undefined') {
      return;
    } 

    const printUrl = getPrintUrl();
    if (!printUrl) {
      return;
    }

    const win = window.open(printUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      return;
    }

    // Dosya yüklendikten sonra doğrudan print dialog'u aç
    win.addEventListener('load', () => {
      try {
        win.focus();
        win.print();
      } catch {
        // çapraz origin saçmalıklarında patlamasın diye boş bırakıyoruz
      }
    });
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1, borderRadius: 0.5, bgcolor: 'background.default' }}
    >
      <Paper
        variant="outlined"
        elevation={0}
        sx={{ p: 1.5, borderRadius: 0, bgcolor: 'background.paper' }}
      >
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            {title ? (
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, lineHeight: 1.2, m: 0, p: 0 }}
              >
                {title}
              </Typography>
            ) : null}

            {showMediaActions ? (
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  LinkComponent={Link}
                  href={downloadHref}
                  aria-label="İndir"
                  size="small"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={handlePrint}
                  aria-label="Yazdır"
                  size="small"
                  disabled={!('code' in props) || !props.code}
                  title={
                    !props.code
                      ? 'Bu ürünün kod bilgisi yok'
                      : 'Yazdır'
                  }
                >
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : null}
          </Box>

          <DetailsTable rows={rows} />

          {/* <NotesMessageBox text={description} /> */}

          {children ? <Box sx={{ pt: 1 }}>{children}</Box> : null}
        </Stack>
      </Paper>
    </Paper>
  );
}
