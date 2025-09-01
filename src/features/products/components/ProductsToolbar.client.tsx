// src/features/products/components/ProductsToolbar.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Stack, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useProductsSelection } from '../selection/ProductsSelectionContext.client';
import BulkDeleteDialog from './BulkDeleteDialog.client';

export default function ProductsToolbar() {
  const { count, clear } = useProductsSelection();
  const [open, setOpen] = React.useState(false);

  const hasSelection = count > 0;

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>

        <Typography variant="h5" >Ürünler</Typography>

        {/* Sağ taraf: Vazgeç + Seçilenleri sil + Ürün Ekle */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            disabled={!hasSelection}
            onClick={clear}            // seçimi sıfırlar
          >
            Vazgeç
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteOutlineIcon />}
            disabled={!hasSelection}
            onClick={() => setOpen(true)} // dialog aç
          >
            Seçilenleri sil {hasSelection ? `(${count})` : ''}
          </Button>

          <Button component={Link} href="/products/new" variant="contained" startIcon={<AddIcon />}>
            Ürün Ekle
          </Button>
          
        </Stack>

      </Stack>

      <BulkDeleteDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
