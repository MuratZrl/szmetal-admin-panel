'use client';

import * as React from 'react';
import { Box, Button, Stack, FormHelperText } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { uploadProductPdfAndGetUrl } from '../services/storage.client';

type Props = {
  code: string;
  value: string;                // public URL (boş string olabilir)
  onChange: (url: string) => void;
  disabled?: boolean;
  errorText?: string;
};

export default function PdfUploadField({ code, value, onChange, disabled, errorText }: Props) {
  const [uploading, setUploading] = React.useState(false);
  const [pdfName, setPdfName] = React.useState<string | null>(null);

  async function handlePdfPick(file?: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductPdfAndGetUrl(code?.trim() || `product-${Date.now()}`, file);
      onChange(url);
      setPdfName(file.name);
    } catch (err) {
      console.error(err);
      alert('PDF yüklenemedi. Bucket ve RLS izinlerini kontrol edin.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Box>
      <input
        id="pdf-input"
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handlePdfPick(e.target.files?.[0] ?? null)}
      />
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          component="label"
          htmlFor="pdf-input"
          disabled={uploading || disabled}
          sx={{ textTransform: 'capitalize' }}
        >
          {uploading ? 'Yükleniyor…' : 'PDF Seç ve Yükle'}
        </Button>
        <Box sx={{ flex: 1, textAlign: 'right', opacity: 0.8, fontSize: 13 }}>
          {pdfName ? `${pdfName} yüklendi` : (value ? 'PDF yüklü' : 'PDF seçilmedi')}
        </Box>
      </Stack>
      {!!errorText && <FormHelperText error>{errorText}</FormHelperText>}
    </Box>
  );
}
