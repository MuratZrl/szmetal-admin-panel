// app/(admin)/products/new/loading.tsx
import * as React from 'react';
import { Box, Divider, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';

function FieldSkeleton({ height = 40 }: { height?: number }): React.JSX.Element {
  return <Skeleton variant="rounded" height={height} sx={{ width: '100%' }} />;
}

export default function Loading(): React.JSX.Element {
  return (
    <Box px={1} py={1} aria-busy="true" aria-live="polite">
      <Typography variant="h5" sx={{ mb: 1 }}>
        <Skeleton variant="text" width={240} />
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container>
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 9 }}>
                <Grid container spacing={2}>
                  
                  {/* Kod / Ad */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Müşteri Kalıbı (small) / Kullanılabilirlik (small) */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Kategori / Alt Kategori */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Varyant (small) / En Alt Kategori */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Birim Ağırlık / Et Kalınlığı */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Çizildiği Tarih (small) / Revizyon Tarihi (small) */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Çizen / Kontrol */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Ölçek / Kesit */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Üretici Kodu / Geçici Kod */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Dış Çevre */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldSkeleton height={40} />
                  </Grid>

                  {/* Dosya seç/yükle + sil */}
                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Skeleton variant="rounded" width={190} height={36} />
                      <Skeleton variant="rounded" width={90} height={36} />
                      <Skeleton variant="text" width={125} />
                    </Stack>
                  </Grid>
                </Grid>

                {/* Alt butonlar */}
                <Stack direction="row" spacing={1} justifyContent="start" sx={{ mt: 2 }}>
                  <Skeleton variant="rounded" width={110} height={36} />
                  <Skeleton variant="rounded" width={110} height={36} />
                </Stack>
              </Grid>

              {/* NotesField şimdilik kapalı ama layout hissi için md'de boş bir kolon bırakıyoruz
              <Grid
                size={{ xs: 12, md: 3 }}
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                <Skeleton variant="rounded" height={260} />
              </Grid> */}

            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
