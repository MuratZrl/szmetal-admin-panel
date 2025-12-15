// src/app/(admin)/products/[id]/loading.tsx
import * as React from 'react';
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Divider,
} from '@mui/material';

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
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{ position: 'absolute', inset: 0 }}
      />
    </Box>
  );
}

function InfoSkeleton(): React.JSX.Element {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1, borderRadius: 0.5, bgcolor: 'background.default' }}
    >
      <Paper
        variant="outlined"
        elevation={0}
        sx={{ p: 1.5, borderRadius: 0, bgcolor: 'background.paper' }}
      >
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Skeleton animation="wave" height={30} width="70%" />
            <Stack direction="row" spacing={0.5}>
              <Skeleton variant="circular" animation="wave" width={32} height={32} />
              <Skeleton variant="circular" animation="wave" width={32} height={32} />
            </Stack>
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 0.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: 'action.hover', // theme callback yok
              }}
            >
              <Skeleton animation="wave" height={18} width={110} />
            </Box>

            <Divider />

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr 1fr',
                      sm: '0.7fr 1.3fr 0.7fr 1.3fr',
                    },
                    columnGap: 2,
                    rowGap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Skeleton animation="wave" height={16} width="65%" />
                  <Skeleton animation="wave" height={16} width="90%" />
                  <Skeleton animation="wave" height={16} width="65%" />
                  <Skeleton animation="wave" height={16} width="90%" />
                </Box>
              ))}
            </Box>
          </Box>

          <Stack direction="row" justifyContent="space-between" spacing={1} flexWrap="wrap">
            <Skeleton variant="rounded" animation="wave" height={36} width={100} />
            <Skeleton variant="rounded" animation="wave" height={36} width={160} />
          </Stack>
        </Stack>
      </Paper>
    </Paper>
  );
}

function CommentSkeleton(): React.JSX.Element {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, borderRadius: 0.5, bgcolor: 'background.paper' }}
    >
      <Stack spacing={1.25}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Skeleton variant="circular" animation="wave" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton animation="wave" height={16} width="35%" />
            <Skeleton animation="wave" height={14} width="25%" />
          </Box>
          <Skeleton variant="rounded" animation="wave" width={64} height={26} />
        </Box>
        <Skeleton animation="wave" height={14} width="92%" />
        <Skeleton animation="wave" height={14} width="85%" />
        <Skeleton animation="wave" height={14} width="60%" />
      </Stack>
    </Paper>
  );
}

function CommentsSectionSkeleton(): React.JSX.Element {
  return (
    <Box>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Skeleton animation="wave" height={22} width={180} />
          <Skeleton variant="rounded" animation="wave" height={34} width={140} />
        </Box>

        <Stack spacing={1.25}>
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </Stack>
      </Stack>
    </Box>
  );
}

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
    </Box>
  );
}
