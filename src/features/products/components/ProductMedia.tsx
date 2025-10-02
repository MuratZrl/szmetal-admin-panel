// src/features/products/components/ProductMedia.tsx
'use client';

import Link from 'next/link';
import { Paper, Box, Stack, Typography, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { detectMediaKind } from '@/features/products/utils/media';

type Props = {
  src?: string | null;
  fileUrl?: string | null;
  fileExt?: string | null;
  fileMime?: string | null;
  alt?: string;
  aspectRatio?: `${number} / ${number}` | number;
  objectFit?: 'contain' | 'cover';
};

function withQuery(u: string, q: Record<string, string>): string {
  // SSR'da absolute'e dönmesin diye base veriyoruz
  const url = new URL(u, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  Object.entries(q).forEach(([k, v]) => url.searchParams.set(k, v));
  // Eğer orijinal path relative ise relative döndür
  return u.startsWith('/') ? (url.pathname + (url.search || '') + (url.hash || '')) : url.toString();
}

function ensureInline(u: string): string {
  // Sadece kendi secure route’umuzsa inline zorla
  return u.startsWith('/api/products/storage')
    ? withQuery(u, { disposition: 'inline' })
    : u;
}

export default function ProductMedia({
  src,
  fileUrl,
  fileExt,
  fileMime,
  alt = 'Dosya',
  aspectRatio = 1.25 / Math.sqrt(2),
  objectFit = 'contain',
}: Props) {
  const srcUrl = (src ?? '').trim();
  const fallbackUrl = (fileUrl ?? '').trim();

  const srcKind = detectMediaKind({ url: srcUrl, mime: fileMime ?? undefined, extHint: fileExt ?? undefined });
  const fbKind  = detectMediaKind({ url: fallbackUrl, mime: fileMime ?? undefined, extHint: fileExt ?? undefined });

  // Tercih sırası
  const chosen =
    (srcUrl && srcKind !== 'unknown' && { url: srcUrl, kind: srcKind }) ||
    (fallbackUrl && fbKind !== 'unknown' && { url: fallbackUrl, kind: fbKind }) ||
    ({ url: '', kind: 'unknown' as const });

  // Görüntüleme için URL (inline zorunlu)
  const viewUrl = chosen.url ? ensureInline(chosen.url) : '';
  // Butonda kullanılacak “aç” linki (o da inline olsun)
  const openHref = viewUrl || (fallbackUrl ? ensureInline(fallbackUrl) : '');

  // PDF viewer için hash paramları
  const pdfViewUrl = chosen.kind === 'pdf' && viewUrl
    ? `${viewUrl}#zoom=page-fit&view=FitH&toolbar=0&navpanes=0`
    : '';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        position: 'relative',
        width: '100%',
        aspectRatio,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
      }}
      aria-label={alt}
    >
      {chosen.kind === 'pdf' && viewUrl ? (
        <Box
          component="object"
          data={pdfViewUrl}
          type="application/pdf"
          sx={{ width: '100%', height: '100%', border: 0 }}
        >
          <Stack spacing={1} alignItems="center">
            <Typography variant="body2">PDF önizlenemedi.</Typography>
            {openHref && (
              <Button
                component={Link}
                href={openHref}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon />}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                PDF’i aç
              </Button>
            )}
          </Stack>
        </Box>
      ) : chosen.kind === 'image' && viewUrl ? (
        <Box
          component="img"
          src={viewUrl}
          alt={alt}
          draggable={false}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) parent.innerHTML = '<div style="opacity:.75;font:14px system-ui">Görsel yüklenemedi</div>';
          }}
          sx={{
            width: '100%',
            height: '100%',
            display: 'block',
            userSelect: 'none',
            objectFit,
          }}
        />
      ) : (
        <Stack spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Önizleme yok
          </Typography>
          {openHref ? (
            <Button
              component={Link}
              href={openHref}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Bağlantıyı aç
            </Button>
          ) : null}
        </Stack>
      )}
    </Paper>
  );
}
