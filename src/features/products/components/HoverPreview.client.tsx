// features/products/components/HoverPreview.client.tsx
'use client';

import * as React from 'react';
import { Popper, Paper, Box, alpha, useTheme, CircularProgress } from '@mui/material';
import PdfPreview from '@/features/products/components/PDFpreview.client';
import Image from 'next/image';

type HoverPreviewProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  src: string;
  alt: string;
  isPdf?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  maxWidth?: number; // px
};

export default function HoverPreview({
  anchorEl,
  open,
  src,
  alt,
  isPdf = false,
  onMouseEnter,
  onMouseLeave,
  maxWidth = 360,
}: HoverPreviewProps) {
  const theme = useTheme();

  // İç kutunun gerçek px genişliğini ölç (PdfPreview için lazım)
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Yüklenme durumu
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useLayoutEffect(() => {
    if (!boxRef.current) return;
    const el = boxRef.current;
    const compute = () => {
      const w = Math.max(1, Math.floor(el.getBoundingClientRect().width));
      const h = Math.max(1, Math.floor((w * 3) / 4));
      setDims({ w, h });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Popper açıldığında ve kaynak değiştiğinde spinner'ı başlat
  React.useEffect(() => {
    if (open) setLoading(true);
  }, [open, src, isPdf]);

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="right-start"
      modifiers={[
        { name: 'offset', options: { offset: [0, 16] } },
        { name: 'preventOverflow', options: { padding: 8 } },
        { name: 'flip', options: { fallbackPlacements: ['left-start', 'right-start'] } },
      ]}
      style={{ zIndex: theme.zIndex.modal + 1 }}
    >

      <Paper
        variant="outlined"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          p: 0.5,
          borderRadius: 0,
          bgcolor: alpha(theme.palette.background.paper, 0.98),
          boxShadow: 6,
        }}
      >
        <Box
          ref={boxRef}
          sx={{
            width: { xs: Math.min(280, maxWidth), sm: maxWidth },
            height: { xs: 250, sm: 285, md: 425 }, // istediğin kadar büyüt
            
            borderRadius: 0,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: 'background.default',
          }}
        >
          {isPdf ? (
            dims.w > 0 ? (
              <PdfPreview
                key={`${src}:${dims.w}`}
                file={src}
                width={dims.w}
                height={dims.h}
              />
            ) : null
          ) : (
            <Box
              sx={{
                position: 'relative',
                inset: 0,
                width: '100%',
                height: '100%',
              }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                loading='eager'
                unoptimized
                sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority={false}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </Box>
          )}

          {/* Spinner overlay */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(theme.palette.background.default, 0.08),
                pointerEvents: 'none',
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Paper>
    
    </Popper>
  );
}
