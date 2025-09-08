// src/features/products/components/ProductMedia.tsx
import Link from 'next/link';
import { Paper, Box, Stack, Typography, Button, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type MediaKind = 'pdf' | 'image' | 'unknown';

type Props = {
  /** Dosya URL'i (PDF ya da görsel) */
  src?: string | null;
  /** Yedek URL (src çözülemezse) */
  fileUrl?: string | null;
  /** Uzantı ipucu (örn. 'pdf', 'png', 'webp', 'jpg', 'jpeg') */
  fileExt?: string | null;
  /** Erişilebilirlik için alt metin */
  alt?: string;
  /** Kutu oranı */
  aspectRatio?: `${number} / ${number}` | number;
};

function extFrom(url?: string | null): string {
  if (!url) return '';
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

function detectKind(url?: string | null, extHint?: string | null): MediaKind {
  const u = (url ?? '').trim();
  if (!u) return 'unknown';

  // data URL kontrolleri
  if (u.startsWith('data:application/pdf')) return 'pdf';
  if (u.startsWith('data:image/')) return 'image';

  const ext = (extHint || extFrom(u)).toLowerCase();

  if (ext === 'pdf') return 'pdf';
  if (ext === 'png' || ext === 'webp' || ext === 'jpg' || ext === 'jpeg') return 'image';

  // Bazı CDN'ler uzantıyı gizler; içerik tipini burada öğrenemeyiz.
  return 'unknown';
}

export default function ProductMedia({
  src,
  fileUrl,
  fileExt,
  alt = 'Dosya',
  aspectRatio = '4 / 3',
}: Props) {
  const srcUrl = (src ?? '').trim();
  const fallbackUrl = (fileUrl ?? '').trim();

  const srcKind = detectKind(srcUrl, fileExt);
  const fbKind = detectKind(fallbackUrl, fileExt);

  const chosen =
    (srcUrl && srcKind !== 'unknown' && { url: srcUrl, kind: srcKind }) ||
    (fallbackUrl && fbKind !== 'unknown' && { url: fallbackUrl, kind: fbKind }) ||
    ({ url: '', kind: 'unknown' as const });

  const showToolbar = chosen.kind !== 'unknown' && !!chosen.url;

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
      {/* Üst sağ köşe: yeni sekmede aç + indir */}
      {showToolbar ? (
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <IconButton
            component={Link}
            href={chosen.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Yeni sekmede aç"
            size="small"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href={chosen.url}
            download
            aria-label="İndir"
            size="small"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : null}

      {chosen.kind === 'pdf' && chosen.url ? (
        <Box
          // PDF gömme: destekleyen tarayıcılarda direkt önizleme
          component="object"
          data={`${chosen.url}#toolbar=0&navpanes=0`}
          type="application/pdf"
          sx={{ width: '100%', height: '100%', border: 0 }}
        >
          {/* PDF embed desteklemeyen tarayıcılar için fallback */}
          <Stack spacing={1} alignItems="center">
            <Typography variant="body2">PDF önizlenemedi.</Typography>
            <Button
              component={Link}
              href={chosen.url}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
              size="small"
            >
              PDF’i aç
            </Button>
          </Stack>
        </Box>
      ) : chosen.kind === 'image' && chosen.url ? (
        // Görsel önizleme
        <Box
          component="img"
          src={chosen.url}
          alt={alt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            userSelect: 'none',
          }}
          draggable={false}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        // Bilinmeyen ya da URL yok
        <Stack spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Önizleme yok
          </Typography>
          {fallbackUrl ? (
            <Button
              component={Link}
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Dosyayı indir
            </Button>
          ) : null}
        </Stack>
      )}
    </Paper>
  );
}
