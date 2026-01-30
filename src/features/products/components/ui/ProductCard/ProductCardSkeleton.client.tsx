'use client';
// src/features/products/components/ui/ProductCard/ProductCardSkeleton.client.tsx

import * as React from 'react';
import { Card, CardContent, Box, Stack, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';

type Props = {
  withFooter?: boolean;
  aspectRatio?: string; // varsayılan: kart media oranı
};

export default function ProductCardSkeleton({
  withFooter = true,
  aspectRatio = '4 / 3.25',
}: Props): React.JSX.Element {
  return (
    <Card
      variant="elevation"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 1.75,
        height: { xs: 'auto', md: '100%' },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio,
          overflow: 'hidden',
          flex: '0 0 auto',
          bgcolor: 'background.default',
        }}
      >
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: 'absolute', inset: 0 }}
        />
      </Box>

      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          gap: 0.75,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.25, sm: 1.5 },
          width: 1,
          minWidth: 0,
        }}
      >
        <Skeleton animation="wave" height={24} width="85%" />
        <Skeleton animation="wave" height={16} width="45%" />

        <Stack direction="column" spacing={0.5} sx={{ my: 0.25 }}>
          <Skeleton animation="wave" height={18} width="70%" />
          <Skeleton animation="wave" height={14} width="55%" />
          <Skeleton animation="wave" height={14} width="50%" />
        </Stack>

        <Skeleton
          animation="wave"
          variant="rounded"
          height={26}
          width="78%"
          sx={{ borderRadius: 999 }}
        />

        <Skeleton animation="wave" height={14} width="60%" />
      </CardContent>

      {withFooter && (
        <Box
          component="footer"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 1, sm: 1.5, md: 1.5 },
            py: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
            backdropFilter: 'saturate(110%) blur(1.5px)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Skeleton animation="wave" variant="rounded" height={32} width={110} />
            <Skeleton animation="wave" variant="rounded" height={32} width={110} />
          </Stack>
        </Box>
      )}
    </Card>
  );
}
