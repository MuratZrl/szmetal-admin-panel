// src/features/products_analytics/components/datagrid/columns.tsx
import type { GridColDef } from '@mui/x-data-grid';

export type ProductAnalyticsRow = {
  id: number;
  code: string;
  name: string;
  variant: string | null;
  category: string | null;
  sub_category: string | null;
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
    flex: 0.8,

    editable: false,
    resizable: false,    
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: 'sub_category',
    headerName: 'Alt Kategori',
    flex: 0.9,

    editable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
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
