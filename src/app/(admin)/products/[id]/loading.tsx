// src/app/(admin)/products/[id]/loading.tsx
import * as React from 'react';
import { Box, Grid, Paper, Skeleton, Stack, Divider } from '@mui/material';

/* -------------------------------------------------------------------------- */
/* Left: Media                                                                 */
/* -------------------------------------------------------------------------- */

function MediaSkeleton(): React.JSX.Element {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1.4142',
        overflow: 'hidden',
        borderRadius: 0.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Skeleton variant="rectangular" animation="wave" sx={{ position: 'absolute', inset: 0 }} />
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* Right: Info + comments                                                      */
/* -------------------------------------------------------------------------- */

function KVPairSkeleton(): React.JSX.Element {
  return (
    <Stack spacing={0.4} sx={{ minWidth: 0 }}>
      <Skeleton animation="wave" height={14} width="65%" />
      <Skeleton animation="wave" height={22} width="75%" />
    </Stack>
  );
}

function DetailsTableSkeleton(): React.JSX.Element {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0.5,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header bar (DetailsTable'daki "Özellikler" başlığı gibi) */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: 'action.hover',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Skeleton animation="wave" height={18} width={120} />
      </Box>

      {/* Body */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Stack spacing={1.25} divider={<Divider flexItem />}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Grid key={idx} container spacing={1.5} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <KVPairSkeleton />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <KVPairSkeleton />
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function ActionsSkeleton(): React.JSX.Element {
  return (
    <Box>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" animation="wave" height={36} width={96} />
            <Skeleton variant="rounded" animation="wave" height={36} width={96} />
          </Stack>
          <Skeleton variant="rounded" animation="wave" height={36} width={120} />
        </Stack>

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton variant="rounded" animation="wave" height={32} width={150} />
        </Box>
      </Stack>
    </Box>
  );
}

function InfoSkeleton(): React.JSX.Element {
  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 0.5, bgcolor: 'background.default' }}>
      <Paper variant="outlined" elevation={0} sx={{ p: 1.5, borderRadius: 0, bgcolor: 'background.paper' }}>
        <Stack spacing={1.5}>
          {/* Header (title + icon buttons) */}
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Skeleton animation="wave" height={30} width="72%" />
              <Stack direction="row" spacing={0.75}>
                <Skeleton variant="circular" animation="wave" width={32} height={32} />
                <Skeleton variant="circular" animation="wave" width={32} height={32} />
              </Stack>
            </Box>

            {/* Title altı divider hissi */}
            <Box sx={{ height: 2, borderRadius: 999, bgcolor: 'divider', opacity: 0.8 }} />

            {/* Meta row (Yükleyen + tarih) */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Skeleton variant="circular" animation="wave" width={18} height={20} />
                <Skeleton animation="wave" height={14} width={70} />
                <Skeleton animation="wave" height={14} width={120} />
              </Box>
              <Skeleton animation="wave" height={14} width={160} />
            </Box>
          </Stack>

          {/* Details table skeleton (gerçek DetailsTable ile uyumlu) */}
          <DetailsTableSkeleton />

          {/* Actions area (Yeni/Eski + Ana Sayfa + altta edit) */}
          <ActionsSkeleton />
        </Stack>
      </Paper>
    </Paper>
  );
}

function CommentFormSkeleton(): React.JSX.Element {
  return (
    <Box>
      <Box
        sx={{
          p: 1.75,
          borderRadius: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1}>
          <Box sx={{ position: 'relative', borderRadius: 0.5, overflow: 'hidden' }}>
            <Skeleton variant="rectangular" animation="wave" height={106} />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                px: 1.25,
              }}
            >
              <Skeleton animation="wave" height={14} width="75%" />
              <Skeleton animation="wave" height={14} width="62%" />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Skeleton animation="wave" height={14} width={70} />
          </Box>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Skeleton variant="rounded" animation="wave" height={36} width={120} />
      </Box>
    </Box>
  );
}

function CommentsSectionSkeleton(): React.JSX.Element {
  return (
    <Box>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Skeleton animation="wave" height={54} width={180} />
          <Skeleton variant="rounded" animation="wave" height={34} width={140} />
        </Box>

        <CommentFormSkeleton />
      </Stack>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* Recommended section skeleton                                                */
/* -------------------------------------------------------------------------- */

function RecommendedCardSkeleton(): React.JSX.Element {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3.25',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Skeleton variant="rectangular" animation="wave" sx={{ position: 'absolute', inset: 0 }} />
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 0.9, flex: '1 1 auto' }}>
        <Skeleton animation="wave" height={18} width="85%" />
        <Skeleton animation="wave" height={14} width="55%" />
        <Skeleton animation="wave" height={14} width="70%" />
        <Skeleton variant="rounded" animation="wave" height={26} width="60%" />
      </Box>

      <Box
        sx={{
          px: { xs: 1, sm: 1.5 },
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Skeleton variant="rounded" animation="wave" height={34} width={92} />
        <Skeleton variant="rounded" animation="wave" height={34} width={92} />
      </Box>
    </Paper>
  );
}

function RecommendedSectionSkeleton(): React.JSX.Element {
  return (
    <Box
      mt={3}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1.25, sm: 1.5 } }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2}>
          <Skeleton animation="wave" height={22} width={180} />
          <Skeleton animation="wave" height={16} width={70} />
        </Stack>
        <Divider sx={{ mt: 1.25 }} />
      </Box>

      <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
        <Grid container spacing={{ xs: 1.25, sm: 1.5, md: 2 }} alignItems="stretch">
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                <RecommendedCardSkeleton />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */

export default function Loading(): React.JSX.Element {
  return (
    <Box px={1} py={1}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MediaSkeleton />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <InfoSkeleton />
            <CommentsSectionSkeleton />
          </Stack>
        </Grid>
      </Grid>

      <RecommendedSectionSkeleton />
    </Box>
  );
}
