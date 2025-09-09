// src/features/products/components/ProductsToolbar.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Stack, Button, Typography, Grid, IconButton, Tooltip, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';

import { useProductsSelection } from '../selection/ProductsSelectionContext.client';
import BulkDeleteDialog from './BulkDeleteDialog.client';
import BulkDeleteAllDialog from './BulkDeleteAllDialog.client';

export default function ProductsToolbar() {
  const { count, clear } = useProductsSelection();
  const [open, setOpen] = React.useState(false);
  const [openAll, setOpenAll] = React.useState(false);

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm')); // xs: ikon-only, sm+: tam buton

  const hasSelection = count > 0;

  return (
    <>
      <Grid
        container
        alignItems="center"
        spacing={1}
        sx={{ mb: 1 }}
      >
        {/* Sol: Başlık */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }} >
          <Typography variant="h5">Ürünleri Listele</Typography>
        </Grid>

        {/* Sağ: Aksiyonlar */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }} >
          {smUp ? (
            // sm ve üstü: tam yazılı butonlar
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              sx={{
                gap: 2,
                flexWrap: 'wrap',
                // metin taşmasın, butonlar kırılabilsin
                '& > *': { minWidth: 0 },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                disabled={!hasSelection}
                onClick={clear}
              >
                Vazgeç
              </Button>

              <Button
                color="error"
                variant="contained"
                startIcon={<DeleteOutlineIcon />}
                disabled={!hasSelection}
                onClick={() => setOpen(true)}
              >
                Seçilenleri sil {hasSelection ? `(${count})` : ''}
              </Button>

              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteForeverIcon />}
                onClick={() => setOpenAll(true)}
              >
                Tümünü Sil
              </Button>

              <Button
                component={Link}
                href="/products/new"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Ürün Ekle
              </Button>
            </Stack>
          ) : (
            // xs: ikon-only, tooltip’lü kompakt sıra
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="flex-end"
              alignItems="center"
            >
              <Tooltip title="Vazgeç">
                <span>
                  <IconButton
                    color="default"
                    disabled={!hasSelection}
                    onClick={clear}
                    aria-label="Vazgeç"
                  >
                    <CloseIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={hasSelection ? `Seçilenleri sil (${count})` : 'Seçilenleri sil'}>
                <span>
                  <IconButton
                    color="error"
                    disabled={!hasSelection}
                    onClick={() => setOpen(true)}
                    aria-label="Seçilenleri sil"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Tümünü Sil">
                <IconButton
                  color="error"
                  onClick={() => setOpenAll(true)}
                  aria-label="Tümünü Sil"
                >
                  <DeleteForeverIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Ürün Ekle">
                <IconButton
                  component={Link}
                  href="/products/new"
                  color="primary"
                  aria-label="Ürün Ekle"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Grid>
      </Grid>

      {/* Dialoglar */}
      <BulkDeleteDialog open={open} onClose={() => setOpen(false)} />
      <BulkDeleteAllDialog open={openAll} onClose={() => setOpenAll(false)} />
    </>
  );
}
