// src/features/products/components/ProductInfo/DetailsTable.client.tsx
'use client';

import * as React from 'react';

import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { darken } from '@mui/material/styles';

import type { DetailItem } from './types';

const surfaceBg = (t: Theme): string =>
  t.palette.mode === 'dark' ? t.palette.background.default : t.palette.background.paper;

const sectionHeaderBg = (t: Theme): string =>
  darken(surfaceBg(t), t.palette.mode === 'dark' ? 0.32 : 0.08);

export type DetailsTableProps = {
  rows: Array<[DetailItem, DetailItem | null]>;
  title?: string;
};

type KVProps = {
  item: DetailItem;
};

function KV({ item }: KVProps): React.JSX.Element {
  const isBold = typeof item.label === 'string' && item.label.startsWith('Birim Ağırlık');

  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
      <Typography
        component="span"
        variant="caption"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
        }}
        title={typeof item.label === 'string' ? item.label : undefined}
      >
        {item.label}
      </Typography>

      <Typography
        component="div" // ✅ p değil, div: içine Box/div vs. girse bile DOM nesting hatası vermez
        variant="body2"
        sx={{
          fontWeight: isBold ? 700 : 500,
          color: 'text.primary',
          lineHeight: 1.35,
          wordBreak: 'break-word',
        }}
      >
        {item.value}
      </Typography>
    </Stack>
  );
}


export function DetailsTable({ rows, title = 'Özellikler' }: DetailsTableProps): React.JSX.Element {
  return (
    <Box
      sx={(t) => ({
        border: 1,
        borderColor: 'divider',
        borderRadius: 0.5,
        overflow: 'hidden',
        bgcolor: surfaceBg(t),
      })}
    >
      <Box
        sx={(t) => ({
          px: 1.5,
          py: 1,
          bgcolor: sectionHeaderBg(t),
          borderBottom: `1px solid ${t.palette.divider}`,
        })}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Stack spacing={1.25} divider={<Divider flexItem />}>
          {rows.map(([a, b], idx) => (
            <Grid key={idx} container spacing={1.5} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <KV item={a} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                {b ? <KV item={b} /> : null}
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default DetailsTable;
