// src/features/systems/components/GridItem.tsx
'use client';

import React from 'react';
import Grid from '@mui/material/Grid';
import type { GridProps, GridSize } from '@mui/material';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Size = Partial<Record<Breakpoint, GridSize>>;

export interface GridItemProps extends Omit<GridProps, Breakpoint> {
  children: React.ReactNode;
  size?: Size;
}

/**
 * Wrapper that maps `size={{ xs: 12, sm: 6, md: 4 }}` -> MUI Grid props.
 */
export default function GridItem({ children, size = {}, ...rest }: GridItemProps) {
  const { xs, sm, md, lg, xl } = size;

  return (
    <Grid size={{ xs: xs, sm: sm, md: md, lg: lg, xl: xl }} {...rest}>
      {children}
    </Grid>
  );
}
