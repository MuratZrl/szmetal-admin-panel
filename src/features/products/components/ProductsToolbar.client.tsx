// src/features/products/components/ProductsToolbar.client.tsx
'use client';

import * as React from 'react';
import Link from '@/components/Link';

import {
  Grid,
  Stack,
  Button,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AddIcon from '@mui/icons-material/Add';

type Perms = { canCreate: boolean };

type Props = {
  perms: Perms;
  totalCount?: number | null;
};

export default function ProductsToolbar({ perms, totalCount }: Props) {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const formattedTotal = React.useMemo(() => {
    const n = typeof totalCount === 'number' ? totalCount : Number(totalCount);
    return Number.isFinite(n) && n >= 0 ? new Intl.NumberFormat('tr-TR').format(n) : '0';
  }, [totalCount]);

  return (
    <Grid container alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="h5" component="h2">
            Profilleri Listele
          </Typography>
          
          <Typography
            variant="subtitle2"
            color="text.secondary"
            aria-live="polite"
            aria-atomic
          >
            ({formattedTotal} ürün)
          </Typography>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        {smUp ? (
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ gap: 2, flexWrap: 'wrap', '& > *': { minWidth: 0 } }}
          >
            {perms.canCreate && (
              <Button
                component={Link}
                href="/products/new"
                variant="text"
                color="contrast"
                size="small"
                startIcon={<AddIcon />}
                draggable={false}
              >
                Yeni Profil Ekle
              </Button>
            )}
          </Stack>
        ) : (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
            {perms.canCreate && (
              <Tooltip title="Profil Ekle">
                <IconButton
                  component={Link}
                  href="/products/new"
                  color="primary"
                  aria-label="Profil Ekle"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}
      </Grid>
    </Grid>
  );
}
