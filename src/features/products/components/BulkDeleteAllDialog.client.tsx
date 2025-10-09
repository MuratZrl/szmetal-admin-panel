// src/features/components/BulkDeleteAllDialog.client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Stack,
  Alert,
  Typography,
  CircularProgress,
} from '@mui/material';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';
import { supabase } from '@/lib/supabase/supabaseClient';
import { deleteAllProducts } from '@/features/products/services/products.client';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';

type Props = { open: boolean; onClose: () => void };

export default function BulkDeleteAllDialog({ open, onClose }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();
  const { clear } = useProductsSelection();

  const [count, setCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Açılınca toplam sayıyı çek
  React.useEffect(() => {
    let active = true;

    async function fetchCount() {
      setLoading(true);
      const { count: total, error } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      if (!active) return;

      if (!error) setCount(total ?? 0);
      setLoading(false);
    }

    if (open) fetchCount();
    return () => {
      active = false;
    };
  }, [open]);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await deleteAllProducts();
      clear();
      show('Tüm ürünler silindi.', 'success');
      onClose();
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      show(`Silme başarısız: ${msg}`, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const confirmDisabled =
    loading || deleting || (count !== null && count <= 0);

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Tüm Ürünleri Sil"
      // description yerine children içinde Alert kullanıyoruz
      confirmText={deleting ? 'Siliniyor…' : 'Tümünü Sil'}
      cancelText="Vazgeç"
      confirmColor="error"
      confirmDisabled={confirmDisabled}
      disableClose={deleting}
      maxWidth="sm"
      fullWidth
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        <Alert severity="warning" variant="outlined">
          Bu işlem geri alınamaz. Bütün ürün kayıtları kalıcı olarak silinecektir.
        </Alert>

        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Toplam ürün sayısı:
          </Typography>

          {loading ? (
            <CircularProgress size={18} />
          ) : (
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {count ?? '—'}
            </Typography>
          )}
        </Stack>
      </Stack>
    </ConfirmDialog>
  );
}
