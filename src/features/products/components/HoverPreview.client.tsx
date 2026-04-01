'use client';
// src/features/products/components/HoverPreview.client.tsx

import * as React from 'react';
import { Popper, Paper, Box } from '@mui/material';
import PdfThumb from '@/features/products/components/ui/PdfThumb.client';

type Kind = 'pdf' | 'image' | 'other';

type BreakWidths = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

type HoverPreviewProps = {
  kind: Kind;
  open: boolean;
  anchorEl: HTMLElement | null;
  src?: string | null;
  baseSize?: { width: number; height: number } | null;
  scale?: number;
  pdfWidths?: BreakWidths;
};

/** PDF kutusu: ResizeObserver ile gerçek boyutu PdfThumb'a iletir */
function PdfPreviewBox({ src, title }: { src: string; title: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Box ref={ref} sx={{ position: 'absolute', inset: 0 }}>
      <PdfThumb src={src} boxSize={size} title={title} />
    </Box>
  );
}

export default function HoverPreview({
  kind,
  open,
  anchorEl,
  src,
  baseSize,
  scale = 2,
  pdfWidths,
}: HoverPreviewProps) {
  if (!open || !anchorEl || !src) return null;

  const isPdf = kind === 'pdf';
  const isImage = kind === 'image';

  const imgWidth = baseSize ? Math.round(baseSize.width * scale) : 540;
  const imgHeight = baseSize ? Math.round(baseSize.height * scale) : 405;

  const pdfW = {
    xs: pdfWidths?.xs ?? 360,
    sm: pdfWidths?.sm ?? 480,
    md: pdfWidths?.md ?? 600,
    lg: pdfWidths?.lg ?? 720,
    xl: pdfWidths?.xl ?? 820,
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement={isPdf ? 'left-start' : 'right-start'}
      modifiers={[
        { name: 'offset', options: { offset: [0, 10] } },
        { name: 'preventOverflow', options: { padding: 8, boundary: 'viewport' } },
        { name: 'computeStyles', options: { gpuAcceleration: false } },
        { name: 'flip', options: { padding: 8 } },
      ]}
      style={{ zIndex: 1300, pointerEvents: 'none' }}
    >
      <Paper elevation={8} sx={{ p: 0, overflow: 'hidden', borderRadius: 3 }}>
        {isPdf ? (
          <Box
            sx={{
              width: pdfW,
              aspectRatio: '210 / 297',
              bgcolor: '#fff',
              position: 'relative',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            <PdfPreviewBox src={src} title="PDF Önizleme" />
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
