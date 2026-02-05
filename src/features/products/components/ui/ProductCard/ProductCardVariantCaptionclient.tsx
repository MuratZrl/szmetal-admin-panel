'use client';
// src/features/products/components/ui/ProductCard/VariantCaption.client.tsx

import * as React from 'react';
import { Typography } from '@mui/material';

import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter';

type Props = {
  variant: string | null | undefined;
  variantMap?: Record<string, string>;
  width?: { xs: string | number; sm: string | number };
};

function resolveLabelFromMap(value: string | null | undefined, map?: Record<string, string>): string {
  const key = (value ?? '').trim();
  if (!key) return '';

  const fromMap = map?.[key];
  if (fromMap && fromMap.trim()) return fromMap.trim();

  if (isSlugLike(key)) return humanizeSystemSlug(key);

  return key;
}

function shouldShowVariant(rawVariant: string, resolvedLabel: string): boolean {
  const raw = rawVariant.trim().toLowerCase();
  if (!raw || raw === 'none' || raw === 'yok') return false;

  const lbl = resolvedLabel.trim().toLowerCase();
  if (!lbl || lbl === 'none' || lbl === 'yok') return false;

  return true;
}

export function VariantCaption({
  variant,
  variantMap,
  width = { xs: '100%', sm: 280 },
}: Props): React.JSX.Element | null {
  const label = React.useMemo(() => resolveLabelFromMap(variant, variantMap).trim(), [variant, variantMap]);

  const show = React.useMemo(() => shouldShowVariant(String(variant ?? ''), label), [variant, label]);
  if (!show) return null;

  const text = `${label} Profilleri`;

  return (
    <Typography
      variant="caption"
      color="text.secondary"
      noWrap
      sx={{
        display: 'block',
        width,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={text}
    >
      {text}
    </Typography>
  );
}
