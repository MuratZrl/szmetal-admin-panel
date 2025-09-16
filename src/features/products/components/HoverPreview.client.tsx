'use client';

import * as React from 'react';
import { Popper, Paper, Box } from '@mui/material';

type Kind = 'pdf' | 'image' | 'other';

type BreakWidths = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

type HoverPreviewProps = {
  kind: Kind;
  open: boolean;
  anchorEl: HTMLElement | null;
  src?: string | null;
  baseSize?: { width: number; height: number } | null;
  // YENİ: büyütme faktörü (görseller için)
  scale?: number;
  // YENİ: PDF genişlikleri (breakpoint bazlı)
  pdfWidths?: BreakWidths;
};

export default function HoverPreview({
  kind,
  open,
  anchorEl,
  src,
  baseSize,
  scale = 2, // eskiden 1.5 idi; default'u zaten daha büyük yaptık
  pdfWidths,
}: HoverPreviewProps) {
  if (!open || !anchorEl || !src) return null;

  const isPdf = kind === 'pdf';
  const isImage = kind === 'image';

  // Görsel için hedef boyut (daha büyük)
  const imgWidth  = baseSize ? Math.round(baseSize.width  * scale) : 540; // 360 -> 540
  const imgHeight = baseSize ? Math.round(baseSize.height * scale) : 405; // 270 -> 405

  // PDF için genişlikleri özelleştirilebilir yap
  const pdfW = {
    xs: pdfWidths?.xs ?? 360,   // 240 -> 360
    sm: pdfWidths?.sm ?? 480,   // 300 -> 480
    md: pdfWidths?.md ?? 600,   // 360 -> 600
    lg: pdfWidths?.lg ?? 720,
    xl: pdfWidths?.xl ?? 820,
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement={isPdf ? 'right-start' : 'left-start'}
      modifiers={[
        { name: 'offset', options: { offset: isPdf ? [16, 16] : [0, 12] } },
        { name: 'preventOverflow', options: { padding: 8, boundary: 'viewport' } },
        { name: 'flip', options: { padding: 8 } },
      ]}
      // Büyük pencerelerde ebeveyn overflow’una takılmayalım
      style={{ zIndex: 1300, pointerEvents: 'none' }}
    >
      <Paper elevation={8} sx={{ p: 0, overflow: 'hidden', borderRadius: 0.75 }}>
        {isPdf ? (
          <Box
            sx={{
              width: pdfW,
              aspectRatio: '210 / 297', // A4
              bgcolor: 'background.paper',
              position: 'relative',
              maxHeight: '90vh', // taşmasın
            }}
          >
            <Box
              component="iframe"
              src={`${src}#page=1&zoom=page-fit&toolbar=0&navpanes=0&scrollbar=0`}
              title="PDF Önizleme"
              loading="lazy"
              sx={{
                position: 'absolute',
                inset: 0,
                width: 1,
                height: 1,
                border: 0,
                pointerEvents: 'none',
              }}
            />
          </Box>
        ) : isImage ? (
          <Box
            sx={{
              width: imgWidth,
              height: imgHeight,
              position: 'relative',
              bgcolor: 'background.default',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          >
            <Box
              component="img"
              src={src}
              alt="Önizleme"
              loading="lazy"
              draggable={false}
              sx={{ position: 'absolute', inset: 0, width: 1, height: 1, objectFit: 'cover' }}
            />
          </Box>
        ) : null}
      </Paper>
    </Popper>
  );
}
