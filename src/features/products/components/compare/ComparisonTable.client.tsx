'use client';
// src/features/products/components/compare/ComparisonTable.client.tsx

import * as React from 'react';
import {
  Box,
  CardMedia,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { Product } from '@/features/products/types';
import type { LabelMaps } from '@/features/products/services/labelMaps.server';
import { formatInt } from '@/features/products/screen/detail/ProductInfo/formatters';
import { detectMediaKind } from '@/features/products/utils/media';
import PdfThumb from '@/features/products/components/ui/PdfThumb.client';

type Props = {
  products: Product[];
  mediaUrlsById: Record<string, string | null>;
  labels: LabelMaps;
};

type SpecRow = {
  label: string;
  extract: (p: Product, labels: LabelMaps) => React.ReactNode;
};

const SPEC_ROWS: SpecRow[] = [
  {
    label: 'Kategori',
    extract: (p, l) => (p.category ? l.category?.[p.category] ?? p.category : '—'),
  },
  {
    label: 'Alt Kategori',
    extract: (p, l) => (p.subCategory ? l.subcategory?.[p.subCategory] ?? p.subCategory : '—'),
  },
  {
    label: 'Varyant',
    extract: (p, l) => (p.variant ? l.variant?.[p.variant] ?? p.variant : '—'),
  },
  {
    label: 'Birim Ağırlık (gr/m)',
    extract: (p) => formatInt(p.unit_weight_g_pm) ?? '—',
  },
  {
    label: 'Et Kalınlığı (mm)',
    extract: (p) => (typeof p.wallThicknessMm === 'number' ? String(p.wallThicknessMm) : '—'),
  },
  {
    label: 'Dış Çevre (mm)',
    extract: (p) => (typeof p.outerSizeMm === 'number' ? String(p.outerSizeMm) : '—'),
  },
  {
    label: 'Kesit (mm²)',
    extract: (p) => (typeof p.sectionMm2 === 'number' ? String(p.sectionMm2) : '—'),
  },
  {
    label: 'Müşteri Kalıbı',
    extract: (p) => {
      const val = p.hasCustomerMold;
      if (typeof val !== 'boolean') return '—';
      return (
        <Chip
          size="small"
          label={val ? 'Evet' : 'Hayır'}
          variant="outlined"
          color={val ? 'warning' : 'default'}
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      );
    },
  },
  {
    label: 'Kullanım Durumu',
    extract: (p) => {
      const val = p.availability;
      if (typeof val !== 'boolean') return '—';
      return (
        <Chip
          size="small"
          label={val ? 'Kullanılabilir' : 'Kullanılamaz'}
          variant="outlined"
          color={val ? 'success' : 'error'}
          sx={{ fontWeight: 600, fontSize: 11 }}
        />
      );
    },
  },
  {
    label: 'Çizildiği Tarih',
    extract: (p) => p.date || '—',
  },
  {
    label: 'Revizyon Tarihi',
    extract: (p) => p.revisionDate || '—',
  },
  {
    label: 'Çizen',
    extract: (p) => p.drawer || '—',
  },
  {
    label: 'Kontrol',
    extract: (p) => p.control || '—',
  },
  {
    label: 'Ölçek',
    extract: (p) => p.scale || '—',
  },
  {
    label: 'Açıklama',
    extract: (p) => p.description || '—',
  },
];

function allSame(values: React.ReactNode[]): boolean {
  if (values.length <= 1) return true;
  const strs = values.map((v) => {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (v && typeof v === 'object' && 'props' in v) {
      const p = v as { props?: { label?: string; children?: React.ReactNode } };
      return p.props?.label ?? String(p.props?.children ?? '');
    }
    return String(v);
  });
  return strs.every((s) => s === strs[0]);
}

function PdfMediaBox({ src, title }: { src: string; title: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Box ref={ref} sx={{ position: 'absolute', inset: 0 }}>
      <PdfThumb src={src} boxSize={size} title={title} />
    </Box>
  );
}

export default function ComparisonTable({ products, mediaUrlsById, labels }: Props) {
  const colCount = products.length;

  return (
    <Stack spacing={3}>
      {/* Ürün kartları — tablo dışında, üstte */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${colCount}, 1fr)`,
          gap: 2,
        }}
      >
        {products.map((p) => {
          const url = mediaUrlsById[p.id] ?? null;
          const kind = detectMediaKind({
            url: url ?? undefined,
            mime: p.fileMime ?? undefined,
            extHint: p.fileExt ?? undefined,
          });
          const isPdf = kind === 'pdf';

          return (
            <Paper
              key={p.id}
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Görsel */}
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  bgcolor: '#fff',
                  position: 'relative',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {url && isPdf ? (
                  <PdfMediaBox src={url} title={`${p.code} — ${p.name}`} />
                ) : url ? (
                  <CardMedia
                    component="img"
                    image={url}
                    alt={p.name ?? 'Ürün'}
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.disabled">
                      Görsel yok
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Bilgi */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  {p.code}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {p.name}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Spec tablosu */}
      <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
            Teknik Özellikler
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: 'text.secondary',
                    bgcolor: 'background.paper',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    width: 180,
                  }}
                >
                  Özellik
                </TableCell>
                {products.map((p) => (
                  <TableCell
                    key={p.id}
                    sx={{
                      fontWeight: 700,
                      fontSize: 13,
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {p.code}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {SPEC_ROWS.map((row, idx) => {
                const values = products.map((p) => row.extract(p, labels));
                const highlight = !allSame(values);

                return (
                  <TableRow
                    key={row.label}
                    sx={(t) => ({
                      '&:last-child td': { borderBottom: 0 },
                      ...(highlight
                        ? {
                            bgcolor:
                              t.palette.mode === 'dark'
                                ? alpha(t.palette.warning.dark, 0.12)
                                : alpha(t.palette.warning.main, 0.06),
                          }
                        : {}),
                    })}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: 12,
                        color: 'text.secondary',
                        width: 180,
                        py: 1.25,
                      }}
                    >
                      {row.label}
                    </TableCell>
                    {values.map((value, i) => (
                      <TableCell key={i} sx={{ py: 1.25 }}>
                        {typeof value === 'string' || typeof value === 'number' ? (
                          <Typography variant="body2" sx={{ fontWeight: highlight ? 600 : 400 }}>
                            {value}
                          </Typography>
                        ) : (
                          value
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
