// src/features/products/components/ProductsGrid.client.tsx
import { Grid } from '@mui/material';
import ProductCard from '@/features/products/components/ui/ProductCard/ProductCard.client';
import type { Product } from '@/features/products/types';

type Role = 'Admin' | 'Manager' | 'User';

type Props = {
  products: Product[];
  mediaUrlsById: Record<string, string | null>;
  /** Kullanıcının rolü; DB’den farklı casing gelebilir diye string | null da kabul ediyoruz. */
  role?: Role | string | null;
};

export default function ProductsGrid({ products, mediaUrlsById, role }: Props) {
  return (
    <Grid container spacing={2}>
      {products.map((p) => {
        const url = mediaUrlsById[String(p.id)] ?? null;
        return (
          <Grid key={String(p.id)} size={{ xs: 12, sm: 6, md: 3 }}>
            <ProductCard
              product={p}
              resolvedImageUrl={url}
              role={role ?? null}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
