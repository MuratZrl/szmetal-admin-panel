// src/features/products/components/ProductMedia.tsx
'use client';

import Link from 'next/link';
import { Paper, Box, Stack, Typography, Button, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { detectMediaKind } from '@/features/products/utils/media';

type Props = {
  /** Ana URL (image veya pdf) */
  src?: string | null;
  /** Yedek URL (ana URL çözülemezse) */
  fileUrl?: string | null;
  /** Uzantı ipucu: 'pdf' | 'png' | 'webp' | 'jpg' | 'jpeg' */
  fileExt?: string | null;
  fileMime?: string | null;    // ← yeni
  /** Erişilebilirlik için alt metin */
  alt?: string;
  /** Kutu oranı (varsayılan 4:3) */
  aspectRatio?: `${number} / ${number}` | number;
  /** Görselde kırpma modu (PDF’yi etkilemez) */
  objectFit?: 'contain' | 'cover';
};

export default function ProductMedia({
  src,
  fileUrl,
  fileExt,
  fileMime,
  alt = 'Dosya',
  aspectRatio = '4 / 3.3',
  objectFit = 'contain',
}: Props) {

  const srcUrl = (src ?? '').trim();
  const fallbackUrl = (fileUrl ?? '').trim();

  const srcKind = detectMediaKind({ url: srcUrl, mime: fileMime ?? undefined, extHint: fileExt ?? undefined });
  const fbKind  = detectMediaKind({ url: fallbackUrl, mime: fileMime ?? undefined, extHint: fileExt ?? undefined });

  // Tercih sırası: src (biliniyorsa) → fileUrl (biliniyorsa) → unknown
  const chosen =
    (srcUrl && srcKind !== 'unknown' && { url: srcUrl, kind: srcKind }) ||
    (fallbackUrl && fbKind !== 'unknown' && { url: fallbackUrl, kind: fbKind }) ||
    ({ url: '', kind: 'unknown' as const });

  // Unknown olsa bile bir URL varsa en azından “bağlantıyı aç” butonu gösterebiliriz
  const anyUrl = srcUrl || fallbackUrl;
  const showToolbar = !!chosen.url || !!anyUrl;

  // PDF’yi sayfaya sığdırmak için viewer query parametreleri
  const pdfViewUrl = chosen.kind === 'pdf' && chosen.url
    ? `${chosen.url}#zoom=page-fit&view=FitH&toolbar=0&navpanes=0`
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
      {/* Sağ üst araç çubuğu */}
      {showToolbar ? (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        >
          <IconButton
            LinkComponent={Link}
            href={(chosen.url || anyUrl) as string}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Yeni sekmede aç"
            size="small"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href={(chosen.url || anyUrl) as string}
            download
            aria-label="İndir"
            size="small"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : null}

      {/* İçerik */}
      {chosen.kind === 'pdf' && chosen.url ? (
        // PDF: tarayıcının yerleşik PDF görüntüleyicisi
        <Box
          component="object"
          data={pdfViewUrl}
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
              startIcon={<OpenInNewIcon />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              PDF’i aç
            </Button>
          </Stack>
        </Box>
      ) : chosen.kind === 'image' && chosen.url ? (
        // Görsel
        <Box
          component="img"
          src={chosen.url}
          alt={alt}
          draggable={false}
          loading='lazy'
          referrerPolicy="no-referrer"
          onError={(e) => {
            // basit metin fallback
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
        // Bilinmeyen/boş
        <Stack spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Önizleme yok
          </Typography>
          {anyUrl ? (
            <Button
              component={Link}
              href={anyUrl}
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
