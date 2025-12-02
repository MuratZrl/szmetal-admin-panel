// src/features/products_analytics/components/datagrid/columns.tsx
'use client';

import * as React from 'react';
import { Box, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { GridColDef } from '@mui/x-data-grid';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


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

function formatKgPerMeter(gPerMeter: number | null): string {
  if (!Number.isFinite(gPerMeter ?? NaN)) return '';
  const kg = (gPerMeter ?? 0) / 1000;
  const fixed = kg.toFixed(3);
  const trimmed = fixed.replace(/\.?0+$/, '');
  return `${trimmed} kg/m`;
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
      if (!trimmed) return '';

      const parts = trimmed
        .split('/')
        .map((p) => p.trim())
        .filter(Boolean);

      if (!parts.length) return '';

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
    headerName: 'Birim Ağırlık',
    flex: 0.7,

    editable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,

    valueFormatter: (value) =>
      formatKgPerMeter(typeof value === 'number' ? value : null),
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

    valueFormatter: (value) =>
      formatBool(
        typeof value === 'boolean' ? value : null,
        'Evet',
        'Hayır',
        '',
      ),
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

    valueFormatter: (value) =>
      formatBool(
        typeof value === 'boolean' ? value : null,
        'Kullanılabilir',
        'Kullanılamaz',
        '',
      ),
  },
];
