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
  const [loading, setLoading] = React.useState<boolean>(false);

  // Eğer selected: Set<number> ise bu satır yeterli:
  const ids = React.useMemo<number[]>(() => Array.from(selected), [selected]);

  // Eğer selected aslında Set<string> ise yukarıdakini şuna değiştir:
  // const ids = React.useMemo<number[]>(
  //   () => Array.from(selected).map((v) => Number(v)).filter(Number.isFinite),
  //   [selected]
  // );

  const count = ids.length;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteProductsByIds(ids); // deleteProductsByIds: number[] bekliyor
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
