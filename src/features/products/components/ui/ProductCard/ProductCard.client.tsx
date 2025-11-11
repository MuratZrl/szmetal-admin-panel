// src/features/products/components/ui/ProductCard.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card, CardActionArea, CardContent, Typography, Stack, Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import HoverPreview from '@/features/products/components/HoverPreview.client';
import { detectMediaKind } from '@/features/products/utils/media';
import type { Product } from '@/features/products/types';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';
import type { LabelMaps } from '@/features/products/services/labelMaps.server';

import { prettyTr } from '@/features/products/utils/tr-text';
import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter';
import { productCanonicalPath, productEditPath } from '@/features/products/utils/url';

// 🔧 DÜZELTME: ProductMedia named export ve doğru path
import { ProductMedia } from '@/features/products/components/ui/ProductCard/ProductMedia.client';

// 🔧 DÜZELTME: Doğru CategoryChip import’u
import { CategoryChip } from '@/features/products/components/ui/ProductCard/CategoryTag.client';
import { ProductActions } from '@/features/products/components/ui/ProductCard/ProductActions.client';

type Role = 'Admin' | 'Manager' | 'User';

type Props = {
  product: Product;
  labels?: LabelMaps;
  resolvedImageUrl?: string | null;
  role?: Role | string | null;
};

function normalizeRole(r: Props['role']): Role {
  
  const v = typeof r === 'string' ? r.trim().toLowerCase() : 'user';
  if (v === 'admin') return 'Admin';
  if (v === 'manager' || v === 'yönetici') return 'Manager';
  if (v === 'user' || v === 'kullanıcı') return 'User';
  
  return 'User';
}

function prettifyLabel(
  value: string | null | undefined,
  map?: Record<string, string> | undefined
): string {
  const raw = prettyTr(value ?? '', map);
  return isSlugLike(raw) ? humanizeSystemSlug(raw) : raw;
}

export default function ProductCard({ product, labels, resolvedImageUrl, role }: Props) {
  const theme = useTheme();

  const { isSelected, toggle } = useProductsSelection();
  const selected = isSelected(product.id);

  const normalizedRole = normalizeRole(role);
  const canSelect = normalizedRole !== 'User';
  const canEdit = normalizedRole === 'Admin' || normalizedRole === 'Manager';

  const variantLabel = prettifyLabel(product.variant, labels?.variant).trim();
  const isVariantNone = variantLabel.toLowerCase() === 'yok';

  const categoryLabel = prettifyLabel(product.category, labels?.category);
  const subLabel      = prettifyLabel(product.subCategory, labels?.subcategory);

  const categoryLine = React.useMemo(() => {
    return [categoryLabel, subLabel].filter(Boolean).join(' / ');
  }, [categoryLabel, subLabel]);

  const displayUrl =
    resolvedImageUrl ??
    (typeof product.image === 'string' && /^https?:\/\//i.test(product.image) ? product.image : null);

  const kind = detectMediaKind({
    url: displayUrl ?? undefined,
    mime: product.fileMime ?? undefined,
    extHint: product.fileExt ?? undefined,
  });

  const isPdf   = kind === 'pdf';
  const isImage = kind === 'image';

  const detailHref = productCanonicalPath(product);
  const editHref   = productEditPath(product);

  return (
    <Card
      variant="elevation"
      data-role={normalizedRole}
      data-can-select={canSelect ? 'true' : 'false'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 1.75,
        height: { xs: 'auto', md: '100%' },
      }}
    >
      <CardActionArea
        LinkComponent={Link}
        href={detailHref}
        draggable={false}
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          minHeight: 0,
          borderRadius: 0,
        }}
      >
        <ProductMedia
          isPdf={isPdf}
          isImage={isImage}
          productName={product.name || 'Ürün'}
          displayUrl={displayUrl ?? null}
          hoverScale={1.8}
          pdfWidths={{ xs: 335, sm: 350, md: 375, lg: 425, xl: 460 }}
          backgroundColor={theme.palette.background.default}
          HoverPreviewComponent={HoverPreview}
        />

        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            gap: 0.75,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
            width: 1,
            minWidth: 0,
          }}
        >
          <Typography
            variant="subtitle1"
            component="p"
            lang="tr"
            title={`${product.code} • ${product.name}`}
            sx={{
              display: 'block',
              width: { xs: '100%', sm: 280 },
              maxWidth: '100%',
              minWidth: 0,
              textAlign: 'start',
              lineHeight: 1.25,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto',
              '&': { wordBreak: 'break-word' },
            }}
          >
            {product.code} — {product.name}
          </Typography>

          <Stack direction="column" my={0.25}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ fontWeight: (t) => t.typography.fontWeightBold }}
            >
              Birim Ağırlık: {product.unit_weight_g_pm} gr
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Yapıldığı Tarih: {product.date}
            </Typography>
          </Stack>

          {(categoryLabel || subLabel) && (
            <CategoryChip
              category={categoryLabel}
              subcategory={subLabel}
              title={categoryLine}
              maxWidth={{ xs: '100%', sm: 280 }}
            />
          )}

          {!!variantLabel && !isVariantNone && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                display: 'block',
                width: { xs: '100%', sm: 280 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={`${variantLabel} Profilleri`}
            >
              {`${variantLabel} Profilleri`}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>

      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 1, sm: 1.5, md: 1.5 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
          backdropFilter: 'saturate(110%) blur(1.5px)',
        }}
      >
        <ProductActions
          canEdit={canEdit}
          canSelect={canSelect}
          selected={selected}
          onToggle={() => toggle(product.id)}
          editHref={editHref}
          detailHref={detailHref}
        />
      </Box>
    </Card>
  );
}
