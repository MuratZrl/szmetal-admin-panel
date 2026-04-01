'use client';
// src/features/products/components/ProductInfo/ProductInfo.client.tsx

import * as React from 'react';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import type { DetailItem, ProductInfoProps } from '../ProductInfo/types';
import { formatInt } from '../ProductInfo/formatters';
import { buildProductInfoRows } from '../ProductInfo/rows';
import { useProductMediaActions } from '../ProductInfo/mediaActions.client';

import DetailsTable from '../ProductInfo/DetailsTable.client';

import ProductHeaderRow from '@/features/products/screen/detail/ProductInfo/ProductRowHeader.client';
import ProductMetaRow from '../ProductInfo/ProductMetaRow.client';

export default function ProductInfo(props: ProductInfoProps): React.JSX.Element {
  const {
    title,
    code,
    variant,
    category,
    subCategory,
    subSubCategory,
    unit_weight_g_pm,
    wallThicknessMm,
    date,
    revisionDate,
    createdAt,
    updatedAt,
    createdBy,
    drawer,
    control,
    scale,
    outerSizeMm,
    sectionMm2,
    labels,
    hasCustomerMold,
    has_customer_mold,
    availability,
    mediaSrc,
    mediaFileUrl,
    mediaExt,
    mediaMime,
    children,
    footerSlot,
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
        variant="outlined"
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
            <Typography component="span" sx={{ color: 'success.main', fontWeight: 500 }}>
              Kullanılabilir
            </Typography>
          )
        : 'Kullanılamaz';

  const { showMediaActions, downloadHref, handlePrint } = useProductMediaActions({
    title,
    mediaSrc,
    mediaFileUrl,
    mediaExt,
    mediaMime,
  });

  const canPrint = Boolean(code);

  const tail: DetailItem[] = [];
  const pushTail = (label: string, value: React.ReactNode) => {
    tail.push({ label, value });
  };

  // ✅ SADECE İSTEDİKLERİN (girildiyse)
  if (typeof wallThicknessMm === 'number') {
    const v = formatInt(wallThicknessMm);
    if (v) pushTail('Et Kalınlığı (mm):', v);
  }

  if (typeof outerSizeMm === 'number') {
    const v = formatInt(outerSizeMm);
    if (v) pushTail('Dış Çevre (mm):', v);
  }

  if (typeof sectionMm2 === 'number') {
    const v = formatInt(sectionMm2);
    if (v) pushTail('Kesit (mm²):', v);
  }

  const rows = buildProductInfoRows({
    variant,
    category,
    subCategory,
    subSubCategory,
    unitWeight: formatInt(unit_weight_g_pm),
    scale: scale ?? undefined,
    date,
    revisionDate,
    drawer,
    control,
    moldChip,
    usageNode,
    tail,
    labels,
  });

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 0.5, bgcolor: 'background.default' }}>
      <Paper
        variant="outlined"
        elevation={0}
        sx={{ p: 1.5, borderRadius: 0, bgcolor: 'background.paper' }}
      >
        <Stack spacing={1.5}>
          <Stack spacing={1.25}>
            <ProductHeaderRow
              title={title}
              showMediaActions={showMediaActions}
              downloadHref={downloadHref}
              onPrint={handlePrint}
              canPrint={canPrint}
            />

            {/* ✅ Title altı divider */}
            <Box
              sx={(t) => ({
                height: 2,
                width: '100%',
                borderRadius: 999,
                bgcolor: t.palette.divider,
                opacity: t.palette.mode === 'dark' ? 0.55 : 1,
              })}
            />

            <ProductMetaRow createdBy={createdBy} createdAt={createdAt ?? null} updatedAt={updatedAt ?? null} />
          </Stack>

          <DetailsTable rows={rows} />

          {children ? <Box sx={{ pt: 1 }}>{children}</Box> : null}
          {footerSlot ? <Box sx={{ pt: 1 }}>{footerSlot}</Box> : null}
        </Stack>
      </Paper>
    </Paper>
  );
}
