'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { updateProduct, type UpdateProductInput } from '@/features/products/services/products.client';

import { useInvalidateProducts } from './useProductQuery.client';

import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

export type UseProductUpdateOptions = {
  invalidateList?: boolean;
  redirectTo?: Route;              // ← string yerine Route
  refreshAfterRedirect?: boolean;
  silent?: boolean;
};

export type UpdateArgs = {
  id: number;
  data: UpdateProductInput;
};

export function useProductUpdate(opts?: UseProductUpdateOptions) {
  const router = useRouter();
  const { list, detail } = useInvalidateProducts();
  const { show } = useSnackbar();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: UpdateArgs) => {
      // service katmanı tip güvenli; undefined alanlara dokunmuyor
      return updateProduct(id, data);
    },

    onSuccess: async (row) => {
      // detail cache’i patlat
      await detail(row.id);

      if (opts?.invalidateList) {
        await list();
      }

      if (!opts?.silent) {
        // kullanıcıya “tamamlandı” de
        show('Ürün güncellendi.', 'success');
      }

      if (opts?.redirectTo) {
        router.push(opts.redirectTo);    // ✅ tipler uydu
        if (opts.refreshAfterRedirect) 
          router.refresh();
      }
    },

    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (!opts?.silent) {
        show(`Güncelleme başarısız: ${msg}`, 'error');
      }
    },
  });

  return mutation;
}
