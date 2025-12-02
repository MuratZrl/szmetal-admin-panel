// src/features/products/components/ProductMedia.client.tsx
'use client';

import Link from '@/components/Link';

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

/** Append query params without accidentally absolutizing a relative URL during SSR. */
function withQuery(u: string, q: Record<string, string>): string {
  const url = new URL(u, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, v);
  return u.startsWith('/') ? url.pathname + (url.search || '') + (url.hash || '') : url.toString();
}

/** Force inline disposition for our secure proxy route. */
function ensureInline(u: string): string {
  return u.startsWith('/api/products/storage') ? withQuery(u, { disposition: 'inline' }) : u;
}

/** True if URL is absolute (http/https or protocol-relative). */
function isExternalUrl(u: string): boolean {
  return /^(?:https?:)?\/\//i.test(u);
}

export default function ProductMedia({
  src,
  fileUrl,
  fileExt,
  fileMime,
  alt = 'File',
  aspectRatio = 1.25 / Math.sqrt(2),
  objectFit = 'contain',
}: Props) {
  const srcUrl = (src ?? '').trim();
  const fallbackUrl = (fileUrl ?? '').trim();

  const srcKind = detectMediaKind({ url: srcUrl, mime: fileMime ?? undefined, extHint: fileExt ?? undefined });
  const fbKind  = detectMediaKind({ url: fallbackUrl, mime: fileMime ?? undefined, extHint: fileExt ?? undefined });

  const chosen =
    (srcUrl && srcKind !== 'unknown' && { url: srcUrl, kind: srcKind }) ||
    (fallbackUrl && fbKind !== 'unknown' && { url: fallbackUrl, kind: fbKind }) ||
    ({ url: '', kind: 'unknown' as const });

  const viewUrl = chosen.url ? ensureInline(chosen.url) : '';
  const openHref = viewUrl || (fallbackUrl ? ensureInline(fallbackUrl) : '');
  const external = openHref ? isExternalUrl(openHref) : false;

  const pdfViewUrl = chosen.kind === 'pdf' && viewUrl
    ? `${viewUrl}#zoom=page-fit&view=FitH&toolbar=0&navpanes=0`
    : '';

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 0.5,
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
            <Typography variant="body2">PDF could not be previewed.</Typography>
            {openHref && (
              <Button
                component={external ? 'a' : Link}
                href={openHref}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                startIcon={<OpenInNewIcon />}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Open PDF
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
            if (parent) parent.innerHTML = '<div style="opacity:.75;font:14px system-ui">Image failed to load</div>';
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
            No preview
          </Typography>
          {openHref ? (
            <Button
              component={external ? 'a' : Link}
              href={openHref}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              startIcon={<OpenInNewIcon />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Open link
            </Button>
          ) : null}
        </Stack>
      )}
    </Paper>
  );
}
