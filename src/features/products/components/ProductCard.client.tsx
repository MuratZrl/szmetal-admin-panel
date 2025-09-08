// src/features/products/components/ProductCard.client.tsx
'use client';

import * as React from 'react';

import {
  Card, CardActionArea, CardContent, CardMedia,
  Typography, Chip, Stack, Checkbox, Box
} from '@mui/material';

import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { alpha, useTheme } from '@mui/material/styles'; // ⬅️ useTheme eklendi

import type { Product } from '../model';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';

// --- yardımcılar
function extFrom(url?: string | null): string {
  if (!url) return '';
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

function svgPlaceholder4x3(opts: { bg: string; fg: string; text: string }): string {
  // 4:3 responsive SVG; 800x600 metadata koyuyoruz ama viewBox ölçeklenebilir
  const { bg, fg, text } = opts;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 4 3" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${bg}"/>
        <stop offset="1" stop-color="${bg}"/>
      </linearGradient>
    </defs>
    <rect width="4" height="3" fill="url(#g)"/>
    <g fill="${fg}">
      <rect x="0.25" y="0.25" width="3.5" height="2.5" fill="none" stroke="${fg}" stroke-width="0.03" stroke-dasharray="0.12 0.12"/>
      <text x="2" y="1.55" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="0.32" font-weight="600">${text}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const theme = useTheme();
  const { isSelected, toggle } = useProductsSelection();
  const selected = isSelected(product.id);

  const isRaster = (u?: string | null): boolean => {
    const ext = (u ? extFrom(u) : '').toLowerCase();
    return /^(png|jpe?g|webp|gif|avif)$/.test(ext) ||
      (u?.startsWith('data:image/') && !u.startsWith('data:image/svg'));
  };

  const ext = String(product.fileExt ?? extFrom(product.image)).toLowerCase();
  const isPdf = ext === 'pdf';

  // Tema uyumlu placeholder üret
  const placeholderSrc = React.useMemo<string>(() => {
    const bg = theme.palette.mode === 'dark'
      ? alpha(theme.palette.grey[900], 0.6)
      : theme.palette.grey[100];
    const fg = theme.palette.mode === 'dark'
      ? theme.palette.grey[300]
      : theme.palette.text.secondary;
    return svgPlaceholder4x3({ bg, fg, text: 'Görsel yok' });
  }, [theme.palette.mode, theme.palette.grey, theme.palette.text]);

  // Önizleme kaynağı: PDF değilse ve raster yoksa placeholder
  const previewSrc =
    isPdf
      ? 'about:blank' // iframe kullanıyoruz; img değil
      : isRaster(product.image)
        ? (product.image as string)
        : placeholderSrc;

  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, position: 'relative' }}>

      <CardActionArea
        href={`/products/${product.id}`}
        draggable={false}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          outline: selected ? '2px solid' : 'none',
          outlineColor: selected ? 'primary.main' : 'transparent',
          transition: 'outline-color .2s',
        }}
      >

        {/* Medya alanı: en = 100%, oran = 4:3 ⇒ H = W × 0.75 */}
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden' }}>
          {isPdf && product.image ? (
            <Box
              component="iframe"
              src={`${product.image}#page=1&view=FitH&toolbar=0&navpanes=0&`}
              title={`${product.name} PDF`}
              loading="eager"
              aria-hidden
              sx={{
                width: '100%',
                height: '100%',
                border: 0,
                pointerEvents: 'none',  // kart tıklanabilir kalsın
                bgcolor: 'background.default',
              }}
            />
          ) : (
            <CardMedia
              component="img"
              image={previewSrc}
              alt={product.name || 'Ürün'}
              draggable={false}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                bgcolor: 'background.default',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ display: 'grid', gap: 0.5 }}>
          <Typography variant="subtitle1" noWrap title={`${product.code} • ${product.name}`}>
            {product.code} — {product.name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Chip size="small" label={product.variant} />
            <Chip size="small" label={`${product.category} / ${product.subCategory}`} variant="outlined" />
          </Stack>

          <Stack direction="column" spacing={0}>
            <Typography variant="caption" color="text.secondary">
              Birim Ağırlık: {product.unit_weight_g_pm} gr
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tarih: {product.date}
            </Typography>
          </Stack>
        </CardContent>

      </CardActionArea>

      {/* Alt sağ checkbox */}
      <Box
        sx={{
          position: 'absolute',
          right: 8,
          bottom: 8,
          bgcolor: t => alpha(t.palette.background.paper, 0.5),
          borderRadius: '35%',
          boxShadow: 1,
        }}
      >
        <Checkbox
          size="small"
          checked={selected}
          onChange={(e) => { e.stopPropagation(); toggle(product.id); }}
          onClick={(e) => e.stopPropagation()}
          icon={<RadioButtonUncheckedIcon />}
          checkedIcon={<RadioButtonCheckedIcon />}
          sx={{ zIndex: 0 }}
        />
      </Box>
    </Card>
  );
}
