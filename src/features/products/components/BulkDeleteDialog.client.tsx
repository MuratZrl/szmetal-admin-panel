// src/features/components/BulkDeleteDialog.client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';
import { deleteProductsByIds } from '@/features/products/services/products.client';

type Props = { open: boolean; onClose: () => void };

export default function BulkDeleteDialog({ open, onClose }: Props) {
  const router = useRouter();
  const { selected, clear } = useProductsSelection();
  const [loading, setLoading] = React.useState(false);

  // selected: Set<string> (uuid) olduğu için string[] olarak çıkarıyoruz
  const ids = React.useMemo<string[]>(() => Array.from(selected), [selected]);

  const count = ids.length;

  const handleConfirm = async () => {
    if (count === 0) return;

    setLoading(true);
    try {
      await deleteProductsByIds(ids); // deleteProductsByIds artık string[] almalı
      clear();
      onClose();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Seçilenleri Sil"
      description={
        count > 0
          ? `${count} ürün kalıcı olarak silinecektir.`
          : 'Seçili ürün bulunmuyor.'
      }
      confirmText={loading ? 'Siliniyor...' : 'Sil'}
      cancelText="Vazgeç"
      confirmColor="error"
      confirmDisabled={loading || count === 0}
      disableClose={loading}
      maxWidth="sm"
      fullWidth
    />
  );
}
