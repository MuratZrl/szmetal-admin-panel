// src/features/products/components/ProductCard.client.tsx
'use client';

import * as React from 'react';
import {
  Card, CardActionArea, CardContent, CardMedia,
  Typography, Chip, Stack, Checkbox, Box
} from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { alpha } from '@mui/material/styles';
import type { Product } from '../model';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';

// --- yardımcılar
function extFrom(url?: string | null) {
  if (!url) return '';
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

export default function ProductCard({ product }: { product: Product }) {
  const { isSelected, toggle } = useProductsSelection();
  const selected = isSelected(product.id);

  // yardımcı
  const isRaster = (u?: string | null) => {
    const ext = (u ? extFrom(u) : '').toLowerCase();
    return /^(png|jpe?g|webp|gif|avif)$/.test(ext) ||
          (u?.startsWith('data:image/') && !u.startsWith('data:image/svg'));
  };

  const ext = String(product.fileExt ?? extFrom(product.image)).toLowerCase();
  const isPdf = ext === 'pdf';

  const previewSrc =
    isPdf
      ? 'https://placehold.co/800x600/png?text=PDF+%C3%96nizleme'
      : isRaster(product.image)
        ? product.image!                                    // ← Supabase/remote raster'ı göster
        : 'https://placehold.co/800x600/png?text=Dosya+Yok';

  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 4, position: 'relative' }}>
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
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
          {/* Sadece placeholder resim */}
          <CardMedia
            component="img"
            image={previewSrc}
            alt={product.name}
            draggable={false}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              bgcolor: 'background.default',
            }}
          />
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
              Ağırlık: {product.unitWeightKg.toFixed(2)} kg
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
          bgcolor: theme => alpha(theme.palette.background.paper, 0.9),
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
        />
      </Box>
    </Card>
  );
}
