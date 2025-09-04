// src/features/systems/components/SystemsGrid.tsx
'use client';

import React from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import SystemCard from '@/features/create_request/components/SystemCard';
import SystemCardSkeleton from '@/features/create_request/components/SystemCardSkeleton.client';
import type { SystemCardType } from '@/features/create_request/types/card';
import GridItem from './GridItem';

export default function SystemsGrid({
  systems,
  loading = false,
  onRequestClick,
  onRetry,
}: {
  systems: SystemCardType[];
  loading?: boolean;
  onRequestClick: (slug: string) => void;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, i) => (
          <GridItem key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <SystemCardSkeleton />
          </GridItem>
        ))}
      </Grid>
    );
  }

  if (!systems || systems.length === 0) {
    return (
      <Box
        sx={{
          px: 2, py: 4, border: '1px dashed',
          borderColor: 'divider', borderRadius: 2, textAlign: 'center'
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Hiç sistem bulunamadı
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ya gerçekten yok, ya da RLS politikaların okuma izni vermiyor.
        </Typography>
        {onRetry && (
          <Button variant="outlined" onClick={onRetry}>
            Yeniden Dene
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {systems.map((s) => (
        <GridItem key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <SystemCard {...s} onRequestClick={() => onRequestClick(s.id)} />
        </GridItem>
      ))}
    </Grid>
  );
}
