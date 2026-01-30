'use client';
// src/features/products_analytics/components/datagrid/columns.tsx

import * as React from 'react';
import { Box, Chip } from '@mui/material';
import { alpha, darken, lighten } from '@mui/material/styles';
import type { GridColDef } from '@mui/x-data-grid';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

export type ProductAnalyticsRow = {
  id: string;
  code: string;
  name: string;
  variant: string | null;
  category: string | null;          // breadcrumb burada
  unit_weight_g_pm: number | null;
  has_customer_mold: boolean | null;
  availability: boolean | null;
};

function formatGrPerMeter(gPerMeter: number | null): string {
  if (!Number.isFinite(gPerMeter ?? NaN)) return '';
  const g = gPerMeter ?? 0;

  // g/m için genelde tam sayı iyi durur:
  const fixed = g.toFixed(0);

  // eğer yine de "trim" istiyorsan (gereksiz ama zarar vermez):
  const trimmed = fixed.replace(/\.?0+$/, '');

  return `${trimmed}`;
}

function formatBool(
  v: boolean | null | undefined,
  trueLabel: string,
  falseLabel: string,
  emptyLabel = '',
): string {
  if (v == null) return emptyLabel;
  return v ? trueLabel : falseLabel;
}

function BoolChip({
  value,
  trueLabel,
  falseLabel,
  kind,
}: {
  value: boolean | null | undefined;
  trueLabel: string;
  falseLabel: string;
  kind: 'availability' | 'mold';
}): React.JSX.Element | null {
  if (value == null) return null;

  const labelText = value ? trueLabel : falseLabel;

  const Icon = (() => {
    if (kind === 'availability') return value ? CheckCircleIcon : CancelIcon;
    return value ? InfoIcon : DoNotDisturbAltIcon;
  })();

  return (
    <Chip
      size="small"
      label={
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            lineHeight: 1,
            maxWidth: '100%',
          }}
        >
          <Box
            component="span"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {labelText}
          </Box>

          <Icon
            style={{
              fontSize: 18,
              flexShrink: 0,
            }}
          />
        </Box>
      }
      sx={(theme) => {
        const tone = (() => {
          if (kind === 'availability') {
            return value ? theme.palette.success.main : theme.palette.error.main;
          }
          return value ? theme.palette.warning.main : theme.palette.grey[600];
        })();

        const bgColor = alpha(tone, theme.palette.mode === 'light' ? 0.1 : 0.15);
        const borderColor = alpha(tone, theme.palette.mode === 'light' ? 0.45 : 0.55);

        // Light mode: yazıyı koyulaştır (kontrast artsın)
        // Dark mode: yazıyı biraz parlat (koyu zeminde boğulmasın)
        const textColor =
          theme.palette.mode === 'light' ? darken(tone, 0.35) : lighten(tone, 0.25);

        return {
          height: 24,
          borderRadius: 999,
          fontWeight: 700,
          letterSpacing: 0.3,
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          color: textColor,

          '& .MuiChip-label': {
            px: 1,
            display: 'block',
            color: textColor,
            fontWeight: 700,
            fontSize: 12,
          },

          '& svg': { color: textColor },
        };
      }}
    />
  );
}

export const productAnalyticsColumns: GridColDef<ProductAnalyticsRow>[] = [
  {
    field: 'code',
    headerName: 'Kod',
    flex: 0.6,

    editable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: 'name',
    headerName: 'Ürün Adı',
    flex: 1.2,

    editable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: 'variant',
    headerName: 'Varyant',
    flex: 0.7,

    editable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: 'category',
    headerName: 'Kategori',
    flex: 1.6,

    editable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
    cellClassName: 'category-cell',

    renderCell: (params) => {
      const raw = params.row.category ?? '';
      const trimmed = raw.trim();

      if (!trimmed) {
        return (
          <Box component="span" sx={{ opacity: 0.55, fontWeight: 600 }}>
            —
          </Box>
        );
      }

      const parts = trimmed
        .split('/')
        .map((p) => p.trim())
        .filter(Boolean);

      if (!parts.length) {
        return (
          <Box component="span" sx={{ opacity: 0.55, fontWeight: 600 }}>
            —
          </Box>
        );
      }

      const titleText = parts.join(' / ');

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            maxWidth: '100%',   // 🔹 height: '100%' SİLİNDİ
          }}
        >
          <Chip
            title={titleText}
            size="medium"
            label={
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.25,
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                {parts.map((part, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <ChevronRightIcon
                        sx={{
                          fontSize: 16,
                          mx: 0.25,
                          flexShrink: 0,
                          opacity: 0.7,
                        }}
                      />
                    )}
                    <Box
                      component="span"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {part}
                    </Box>
                  </React.Fragment>
                ))}
              </Box>
            }
            sx={(theme) => ({
              maxWidth: '100%',
              borderRadius: 999,
              px: 1,
              borderColor: 'transparent',
              backgroundColor: alpha(
                theme.palette.accent?.main ?? theme.palette.primary.main,
                0.16,
              ),
              color: theme.palette.text.primary,
              '& .MuiChip-label': {
                display: 'block',
                maxWidth: '100%',
                paddingX: 0,
              },
            })}
          />
        </Box>
      );
    },
  },
  {
    field: 'unit_weight_g_pm',
    headerName: 'Birim Ağırlık (gr/m)',
    flex: 0.7,

    editable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,

    valueFormatter: (value) =>
      formatGrPerMeter(typeof value === 'number' ? value : null),
  },
  {
    field: 'has_customer_mold',
    headerName: 'Müşteri Kalıbı',
    flex: 0.7,
    type: 'boolean',

    editable: false,
    sortable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,

    align: 'center',
    headerAlign: 'center',

    renderCell: (params) => (
      <BoolChip
        kind="mold"
        value={params.row.has_customer_mold}
        trueLabel="Evet"
        falseLabel="Hayır"
      />
    ),

    valueFormatter: (value) =>
      formatBool(typeof value === 'boolean' ? value : null, 'Evet', 'Hayır', ''),
  },
  {
    field: 'availability',
    headerName: 'Durum',
    flex: 0.6,
    type: 'boolean',

    editable: false,
    sortable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,

    align: 'center',
    headerAlign: 'center',

    renderCell: (params) => (
      <BoolChip
        kind="availability"
        value={params.row.availability}
        trueLabel="Kullanılabilir"
        falseLabel="Kullanılamaz"
      />
    ),

    valueFormatter: (value) =>
      formatBool(
        typeof value === 'boolean' ? value : null,
        'Kullanılabilir',
        'Kullanılamaz',
        '',
      ),
  },
];
