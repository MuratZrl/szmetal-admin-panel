// src/features/products/components/ProductDetailActions.client.tsx
'use client';

import Link from 'next/link';
import { Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';

export default function ProductDetailActions({ id }: { id: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"   // ← sağa itmek için
      spacing={1}
      sx={{ width: '100%' }}           // ← container genişliğini kaplasın
    >
      
      {/* Sol grup: Geri + Düzenle */}
      <Stack direction="row" spacing={1}>
        <Button
          component={Link}
          href={`/products/${id}`}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={(e) => {
            e.preventDefault();
            if (typeof window !== 'undefined' && window.history.length > 1) window.history.back();
            else window.location.href = `/products/${id}`;
          }}
          sx={{ textTransform: 'capitalize', borderRadius: 2 }}
        >
          Geri
        </Button>

        <Button
          component={Link}
          href={`/products/${id}/edit`}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ textTransform: 'capitalize', borderRadius: 2 }}
        >
          Düzenle
        </Button>
      </Stack>

      {/* Sağ uç: Yazdır */}
      <Button
        variant="outlined"
        startIcon={<PrintIcon />}
        onClick={() => typeof window !== 'undefined' && window.print()}
        sx={{ textTransform: 'capitalize', borderRadius: 2 }}
        aria-label="Sayfayı yazdır"
      >
        Yazdır
      </Button>
    </Stack>
  );
}
