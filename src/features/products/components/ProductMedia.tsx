// src/features/products/components/ProductMedia.tsx
import Link from 'next/link';
import { Paper, Box, Stack, Typography, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

type Props = {
  src?: string | null;          // PDF URL (tercihen)
  alt?: string;                 // erişilebilirlik için
  fileUrl?: string | null;      // yedek PDF URL
  fileExt?: string | null;      // uzantı ipucu (daha güvenli tespit)
  aspectRatio?: `${number} / ${number}` | number;
};

function extFrom(url?: string | null) {
  if (!url) return '';
  const clean = url.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

function looksLikePdf(url?: string | null, extHint?: string | null) {
  const u = (url ?? '').trim();
  const hint = (extHint ?? extFrom(u)).toLowerCase();
  if (!u) return false;
  if (u.startsWith('data:application/pdf')) return true;
  if (hint === 'pdf') return true;
  // Bazı CDN’ler uzantı koymaz; içerik tipi kontrol edemiyoruz, o yüzden burada duruyoruz.
  return false;
}

export default function ProductMedia({
  src,
  alt = 'PDF',
  fileUrl,
  fileExt,
  aspectRatio = '4 / 3',
}: Props) {
  const srcUrl = (src ?? '').trim();
  const fallbackUrl = (fileUrl ?? '').trim();

  // Önce src PDF mi, değilse fileUrl PDF mi?
  const pdfFromSrc = looksLikePdf(srcUrl, fileExt);
  const pdfFromFile = !pdfFromSrc && looksLikePdf(fallbackUrl, fileExt);
  const pdfUrl = pdfFromSrc ? srcUrl : (pdfFromFile ? fallbackUrl : '');

  const showNothing = !pdfUrl;

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
      {!showNothing ? (
        <Box
          // Not: <iframe> da olur; <object> PDF için genelde yeterli.
          component="object"
          data={`${pdfUrl}#toolbar=0&navpanes=0`} // daha sade görünüm; destekleyenlerde işe yarar
          type="application/pdf"
          sx={{ width: '100%', height: '100%', border: 0 }}
        >
          {/* PDF embed desteklemeyen tarayıcılar için fallback */}
          <Stack spacing={1} alignItems="center">
            <Typography variant="body2">PDF önizlenemedi.</Typography>
            <Button
              component={Link}
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
              size="small"
            >
              PDF’i aç
            </Button>
          </Stack>
        </Box>
      ) : (
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
