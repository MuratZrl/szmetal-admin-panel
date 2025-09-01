// src/features/products/components/BulkDeleteDialog.client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';
import { deleteProductsByIds } from '@/features/products/services/products.client';

type Props = { open: boolean; onClose: () => void };

export default function BulkDeleteDialog({ open, onClose }: Props) {
  const router = useRouter();
  const { selected, clear } = useProductsSelection(); // toggleMode çıkarıldı
  const [loading, setLoading] = React.useState(false);
  const ids = React.useMemo(() => Array.from(selected), [selected]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteProductsByIds(ids);
      clear();
      onClose();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose}>
      <DialogTitle>Seçilenleri sil</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {ids.length} ürünü kalıcı olarak sileceğim. Devam edelim mi?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Vazgeç</Button>
        <Button color="error" variant="contained" onClick={handleConfirm} disabled={loading || !ids.length}>
          Sil
        </Button>
      </DialogActions>
    </Dialog>
  );
}
