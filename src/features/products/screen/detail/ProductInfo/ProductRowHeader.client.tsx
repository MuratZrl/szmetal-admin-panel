// src/features/products/components/ProductInfo/ProductHeaderRow.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';

import { Box, IconButton, Stack, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';

type Props = {
  title?: string | null;
  showMediaActions: boolean;
  downloadHref?: string | null;
  onPrint: () => void;
  canPrint: boolean;
};

export default function ProductHeaderRow({
  title,
  showMediaActions,
  downloadHref,
  onPrint,
  canPrint,
}: Props): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        minWidth: 0,
      }}
    >
      {title ? (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            m: 0,
            p: 0,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={title}
        >
          {title}
        </Typography>
      ) : (
        <span />
      )}

      {showMediaActions ? (
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          {downloadHref ? (
            <IconButton LinkComponent={Link} href={downloadHref} aria-label="İndir" size="small">
              <DownloadIcon fontSize="small" />
            </IconButton>
          ) : null}

          <IconButton
            onClick={onPrint}
            aria-label="Yazdır"
            size="small"
            disabled={!canPrint}
            title={!canPrint ? 'Bu ürünün kod bilgisi yok' : 'Yazdır'}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : null}
    </Box>
  );
}
