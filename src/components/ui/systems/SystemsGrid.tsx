// src/features/systems/components/SystemsGrid.tsx
'use client';

import React from 'react';
import { Grid } from '@mui/material';
import SystemCard from './SystemCard';
import SystemCardSkeleton from '@/components/skeletons/SystemCard';
import type { SystemCardType } from '@/types/systems';
import GridItem from './GridItem';

export default function SystemsGrid({
  systems,
  onRequestClick,
}: {
  systems: SystemCardType[];
  onRequestClick: (slug: string) => void;
}) {
  const isEmpty = !systems || systems.length === 0;

  return (
    <Grid container spacing={2} >
      {isEmpty
        ? Array.from({ length: 8 }).map((_, i) => (
            <GridItem key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} >
              <SystemCardSkeleton />
            </GridItem>
          ))
        : systems.map((s) => (
            <GridItem key={s.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} >
              <SystemCard {...s} onRequestClick={() => onRequestClick(s.links.requestPage.split('/systems/')[1])} />
            </GridItem>
          ))}
    </Grid>
  );
}
