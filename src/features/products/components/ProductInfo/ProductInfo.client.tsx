// src/features/products/components/ProductInfo/ProductInfo.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';

import { Box, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';

import type { DetailItem, ProductInfoProps } from './types';
import { formatInt } from './formatters';
import { buildProductInfoRows } from './rows';
import { useProductMediaActions } from './mediaActions.client';

import DetailsTable from './DetailsTable.client';

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

  const createdDate = typeof createdAt === 'string' && createdAt ? createdAt.slice(0, 10) : '';

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
    scale: scale ?? undefined, // ✅ DEĞER BURADA GÖNDERİLİR
    date,
    revisionDate,
    drawer,
    control,
    moldChip,
    usageNode,
    tail,
    labels,
  });

  const createdByText = createdBy || 'Bilinmiyor';

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 0.5, bgcolor: 'background.default' }}>
      <Paper variant="outlined" elevation={0} sx={{ p: 1.5, borderRadius: 0, bgcolor: 'background.paper' }}>
        <Stack spacing={1.5}>
          
          <Stack spacing={1.25}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                minWidth: 0,
              }}
            >
              {title ? (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.2,
                    m: 0,
                    p: 0,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </Typography>
              ) : (
                <span />
              )}

              {showMediaActions ? (
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <IconButton LinkComponent={Link} href={downloadHref} aria-label="İndir" size="small">
                    <DownloadIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={handlePrint}
                    aria-label="Yazdır"
                    size="small"
                    disabled={!canPrint}
                    title={!canPrint ? 'Bu ürünün kod bilgisi yok' : 'Yazdır'}
                  >
                    <PrintIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : null}
            </Box>

            {/* ✅ Title altı divider TAM BURADA */}
            <Box
              sx={(t) => ({
                height: 2,
                width: '100%',
                borderRadius: 999,
                bgcolor: t.palette.divider,
                opacity: t.palette.mode === 'dark' ? 0.55 : 1,
              })}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.85,
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <PersonOutlineIcon fontSize="small" />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0, letterSpacing: 0.2, fontStyle: 'italic' }}
                >
                  Yükleyen:
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    opacity: createdBy ? 1 : 0.75,
                  }}
                  title={createdBy ?? undefined}
                >
                  {createdByText}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontStyle: 'italic',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  opacity: createdDate ? 0.9 : 0.6,
                }}
                title={createdAt ?? undefined}
              >
                {createdDate ? `Eklenme tarihi: ${createdDate}` : 'Eklenme tarihi: —'}
              </Typography>
            </Box>
          </Stack>

          <DetailsTable rows={rows} />

          {children ? <Box sx={{ pt: 1 }}>{children}</Box> : null}
          {footerSlot ? <Box sx={{ pt: 1 }}>{footerSlot}</Box> : null}
        </Stack>
      </Paper>
    </Paper>
  );
}
