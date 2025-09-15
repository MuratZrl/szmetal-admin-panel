// src/features/products/components/ProductCard.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card, CardActionArea, CardContent, CardMedia,
  Typography, Chip, Stack, Checkbox, Box, useMediaQuery
} from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { alpha, useTheme } from '@mui/material/styles';

import HoverPreview from '@/features/products/components/HoverPreview.client';

import type { Product } from '../types/product';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';
import { LabelMaps } from '@/features/products/utils/labelMaps.server';
import { prettyTr } from '@/features/products/utils/tr-text';

type Props = { product: Product; labels?: LabelMaps };

// --- yardımcılar
function extFrom(url?: string | null): string {
  if (!url) return '';
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

function svgPlaceholder4x3(opts: { bg: string; fg: string; text: string }): string {
  const { bg, fg, text } = opts;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 4 3" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${bg}"/></linearGradient></defs>
    <rect width="4" height="3" fill="url(#g)"/>
    <g fill="${fg}">
      <rect x="0.25" y="0.25" width="3.5" height="2.5" fill="none" stroke="${fg}" stroke-width="0.03" stroke-dasharray="0.12 0.12"/>
      <text x="2" y="1.55" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="0.32" font-weight="600">${text}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function ProductCard({ product, labels }: Props) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  const { isSelected, toggle } = useProductsSelection();
  const selected = isSelected(product.id);

  // component içinde, state'ler
  const [hoverAnchor, setHoverAnchor] = React.useState<HTMLElement | null>(null);
  const [hoverOpen, setHoverOpen] = React.useState<boolean>(false);

  // Tarayıcı hover destekliyor mu? (mobilde açmayalım)
  const canHover = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  // titreme önlemek için minik gecikme
  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  function clearTimers() {
    if (openTimer.current) { window.clearTimeout(openTimer.current); openTimer.current = null; }
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
  }

  function handleEnter(e: React.MouseEvent<HTMLElement>) {
    if (!canHover) return;
    clearTimers();
    setHoverAnchor(e.currentTarget);
    openTimer.current = window.setTimeout(() => setHoverOpen(true), 120);
  }

  function handleLeave() {
    if (!canHover) return;
    clearTimers();
    closeTimer.current = window.setTimeout(() => setHoverOpen(false), 120);
  }

  // Popper üstüne gelince kapanmasın
  function handlePreviewEnter() {
    if (!canHover) return;
    clearTimers();
  }
  function handlePreviewLeave() {
    if (!canHover) return;
    handleLeave();
  }

  // unmount'ta timer temizliği
  React.useEffect(() => clearTimers, []);


  function isRaster(u?: string | null): boolean {
    const ext = (u ? extFrom(u) : '').toLowerCase();
    const rasterByExt = /^(png|jpe?g|webp|gif|avif)$/.test(ext);

    // undefined → false
    const isDataImageButNotSvg = !!(u?.startsWith('data:image/') && !u?.startsWith('data:image/svg'));

    return rasterByExt || isDataImageButNotSvg;
  }

  const variantLabel   = prettyTr(product.variant,     labels?.variant);
  const categoryLabel  = prettyTr(product.category,    labels?.category);
  const subLabel       = prettyTr(product.subCategory, labels?.subcategory);

  const ext = String(product.fileExt ?? extFrom(product.image)).toLowerCase();
  const isPdf = ext === 'pdf';

  // Tema uyumlu placeholder
  const placeholderSrc = React.useMemo<string>(() => {
    const bg = theme.palette.mode === 'dark'
      ? alpha(theme.palette.grey[900], 0.6)
      : theme.palette.grey[100];
    const fg = theme.palette.mode === 'dark'
      ? theme.palette.grey[300]
      : theme.palette.text.secondary;
    return svgPlaceholder4x3({ bg, fg, text: isPdf ? 'PDF Önizleme' : 'Görsel yok' });
  }, [theme.palette.mode, theme.palette.grey, theme.palette.text, isPdf]);

  const [imgError, setImgError] = React.useState<boolean>(false);

  // Önizleme kaynağı
  const previewSrc = isPdf
    ? 'about:blank'
    : isRaster(product.image)
      ? (product.image as string)
      : placeholderSrc;

  const finalImgSrc = imgError ? placeholderSrc : previewSrc;

  return (
    <Card
      variant='elevation'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 2,
        // Küçük ekranda içerik kadar, md+ eş yükseklik grid için 100%
        height: { xs: 'auto', md: '100%' },
      }}
    >

      <CardActionArea
        LinkComponent={Link}
        href={`/products/${product.id}`}
        draggable={false}
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          minHeight: 0, // flex overflow/çakışma önler
          borderRadius: 0,
          transition: 'outline-color .2s',
        }}
      >

        <Box
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 250, sm: 285, md: 425 }, // istediğin kadar büyüt
            overflow: 'hidden',
            flex: '0 0 auto',
          }}
        >
          {isPdf && product.image
            ? (
              // Mobile’da PDF iframe yok, ağır
              downSm ? (
                <CardMedia
                  component="img"
                  image={placeholderSrc}
                  alt={`${product.name || 'Ürün'} PDF`}
                  draggable={false}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', bgcolor: 'background.default' }}
                />
              ) : (
                <Box
                  component="iframe"
                  // PDF'yi çerçeveye sığdır: zoom=page-fit / view=Fit
                  // toolbar/navpanes gizle
                  src={`${product.image}#zoom=page-fit&view=Fit&toolbar=0&navpanes=0`}
                  title={`${product.name} PDF`}
                  loading="eager"
                  aria-hidden
                  // bazı tarayıcılarda hâlâ çalışabiliyor, dursun:
                  scrolling="no"
                  sx={{
                    position: 'relative',
                    inset: 0,
                    // HILE: iframe’i sağdan 20px genişlet → scrollbar görünür alanın dışında kalır
                    width: 'calc(100% + 20px)',
                    height: '100%',
                    border: 0,
                    pointerEvents: 'none',
                    bgcolor: 'background.default',
                  }}
                />
              )
            ) : (
              <CardMedia
                component={'img'}
                image={finalImgSrc}
                alt={product.name || 'Ürün'}
                draggable={false}
                loading='lazy'
                // <img>’e geçer, CardMedia forward eder
                sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw"
                onError={() => setImgError(true)}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  bgcolor: 'background.default',
                }}
              />
            )
          }
        </Box>

        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',     // ← kalan yüksekliği alsın
            gap: 0.75,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
            width: 1,             // ← 85% bırak; hizalama sapması yapıyor
          }}
        >
          {/* Başlık 2 satır clamp */}
          <Typography
            variant="subtitle1"
            title={`${product.code} • ${product.name}`}
            sx={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              lineHeight: 1.25,
              fontSize: { xs: '0.95rem', sm: '1rem' },
            }}
          >
            {product.code} — {product.name}
          </Typography>

          <Stack direction="column" spacing={0.25} my={0.5}>
            <Typography variant="caption" color="text.secondary">
              Birim Ağırlık: {product.unit_weight_g_pm} gr
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tarih: {product.date}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              maxWidth: 1, // 100%
            }}
          >
            <Chip 
              size="small" 
              label={`${variantLabel} Profilleri`} 
              sx={{
                textTransform: 'none',
                maxWidth: 1,           // 100%
                height: 'auto',        // sabit yükseklik yok
                alignItems: 'flex-start',
                '& .MuiChip-label': {
                  display: 'block',
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  py: 0.25,
                },
              }}
            />
            
            <Chip 
              size="small" 
              label={`${categoryLabel} / ${subLabel}`} 
              variant="filled" 
              sx={{
                textTransform: 'none',
                maxWidth: 1,           // 100%
                height: 'auto',        // sabit yükseklik yok
                alignItems: 'flex-start',
                '& .MuiChip-label': {
                  display: 'block',
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  py: 0.25,
                },
              }}
            />
          </Stack>

        </CardContent>

      </CardActionArea>

      {/* ↓↓↓ YENİ: her daim en altta duran footer */}
      <Box
        component="footer"
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1, sm: 1.5, md: 0.5 },
          py: { xs: 0.5, sm: 0.75 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: t => alpha(t.palette.background.paper, 0.8),
        }}
      >
        <Checkbox
          aria-label="Ürünü seç"
          size="small"
          checked={selected}
          // Link CardActionArea’nın dışında kaldığı için onClick stopPropagation şart değil,
          // yine de alışkanlıktan koyuyorum; zarar gelmez.
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggle(product.id)}
          icon={<RadioButtonUncheckedIcon />}
          checkedIcon={<RadioButtonCheckedIcon />}
        />
      </Box>

      <HoverPreview
        anchorEl={hoverAnchor}
        open={hoverOpen}
        src={isPdf && product.image ? String(product.image) : finalImgSrc} // ← PDF ise gerçek dosya URL’si
        alt={product.name || 'Ürün'}
        isPdf={isPdf}
        onMouseEnter={handlePreviewEnter}
        onMouseLeave={handlePreviewLeave}
        maxWidth={460}
      />

    </Card>
  );
}
