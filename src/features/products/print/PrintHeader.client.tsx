'use client';

import * as React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

type Props = { title: string; pdfHref?: string | null };

export default function PrintHeader({ title }: Props) {
  const onPrint = React.useCallback(() => {
    try { window.print(); } catch {}
  }, []);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: 'background.paper',
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
        py: 1,
        px: 2,
        '@media print': { display: 'none' }, // yazdırmada gizle
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
        <Typography variant="subtitle1" noWrap>
          {title} - Sayfa Önizleme
        </Typography>

        <Stack direction="row" spacing={1}>

          <Button
            variant="contained"
            size="small"
            startIcon={<PrintIcon />}
            onClick={onPrint}
          >
            Yazdır
          </Button>

        </Stack>
      </Stack>
    </Box>
  );
}
