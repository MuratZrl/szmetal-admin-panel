// src/app/(admin)/products/loading.tsx
import * as React from 'react';

import { Box, Divider, Grid, Skeleton, Stack } from '@mui/material';

import ProductCardSkeleton from '@/features/products/components/ui/ProductCard/ProductCardSkeleton.client';

const DEFAULT_PAGE_SIZE = 16;

const sectionShellSx = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  bgcolor: 'background.paper',
  px: 1.25,
  py: 1.25,
} as const;

function CheckRowSkeleton({ width = '70%' }: { width?: number | string }): React.JSX.Element {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Skeleton variant="rounded" width={18} height={18} />
      <Skeleton height={16} width={width} />
    </Stack>
  );
}

function SearchSectionSkeleton(): React.JSX.Element {
  return (
    <Box sx={sectionShellSx}>
      <Skeleton height={16} width={110} sx={{ opacity: 0.75 }} />
      <Skeleton variant="rounded" height={40} sx={{ mt: 1.5 }} />
    </Box>
  );
}

function StatusSectionSkeleton(): React.JSX.Element {
  return (
    <Box sx={sectionShellSx}>
      <Skeleton height={16} width={90} sx={{ opacity: 0.75 }} />
      <Stack spacing={1} sx={{ mt: 1 }}>
        <CheckRowSkeleton width="65%" />
        <CheckRowSkeleton width="60%" />
      </Stack>
    </Box>
  );
}

function CategorySectionSkeleton(): React.JSX.Element {
  return (
    <Box sx={sectionShellSx}>
      <Skeleton height={16} width={100} sx={{ opacity: 0.75 }} />
      <Box sx={{ mt: 1.25, maxHeight: 6 * 44, overflow: 'hidden', pr: 1 }}>
        <Stack spacing={1}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Stack key={i} spacing={1}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Skeleton variant="rounded" width={18} height={18} />
                <Skeleton height={16} width={`${60 + (i % 3) * 10}%`} />
                <Box sx={{ flex: 1 }} />
                <Skeleton variant="rounded" width={18} height={18} sx={{ opacity: 0.6 }} />
              </Stack>
              {i < 5 ? <Divider /> : null}
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function VariantSectionSkeleton(): React.JSX.Element {
  return (
    <Box sx={sectionShellSx}>
      <Skeleton height={16} width={110} sx={{ opacity: 0.75 }} />
      <Skeleton variant="rounded" height={32} sx={{ mt: 1.5, mb: 1 }} />
      <Box sx={{ maxHeight: 7 * 36, overflow: 'hidden', pr: 1 }}>
        <Stack spacing={1}>
          {Array.from({ length: 7 }).map((_, i) => (
            <CheckRowSkeleton key={i} width={`${55 + (i % 4) * 10}%`} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function DateRangeSectionSkeleton(): React.JSX.Element {
  return (
    <Box sx={sectionShellSx}>
      <Skeleton height={16} width={70} sx={{ opacity: 0.75 }} />
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6 }}>
          <Skeleton variant="rounded" height={40} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Skeleton variant="rounded" height={40} />
        </Grid>
      </Grid>
    </Box>
  );
}

function SortSectionSkeleton(): React.JSX.Element {
  return (
    <Box sx={sectionShellSx}>
      <Skeleton height={16} width={90} sx={{ opacity: 0.75 }} />
      <Skeleton variant="rounded" height={40} sx={{ mt: 1 }} />
    </Box>
  );
}

function ActionsSectionSkeleton(): React.JSX.Element {
  return (
    <Box sx={{ ...sectionShellSx, p: 1 }}>
      <Skeleton variant="rounded" height={36} />
    </Box>
  );
}

function FiltersPanelSkeleton(): React.JSX.Element {
  return (
    <Stack spacing={2} sx={{ position: 'sticky', top: 16 }}>
      <SearchSectionSkeleton />
      <StatusSectionSkeleton />
      <CategorySectionSkeleton />
      <VariantSectionSkeleton />
      <DateRangeSectionSkeleton />
      <SortSectionSkeleton />
      <ActionsSectionSkeleton />
    </Stack>
  );
}

function ToolbarSkeleton(): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.25 }}>
      <Skeleton height={36} width={240} />
      <Skeleton height={36} width={140} />
      <Box sx={{ flex: 1 }} />
      <Skeleton variant="rounded" height={36} width={160} />
    </Stack>
  );
}

function PaginationSkeleton(): React.JSX.Element {
  return (
    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
      <Skeleton variant="rounded" height={36} width={110} />
      <Skeleton variant="rounded" height={36} width={110} />
    </Stack>
  );
}

function ProductsGridSkeleton(): React.JSX.Element {
  return (
    <Grid container spacing={1}>
      {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <ProductCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

export default function Loading(): React.JSX.Element {
  return (
    <Box px={1} py={1}>
      <ToolbarSkeleton />
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FiltersPanelSkeleton />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <ProductsGridSkeleton />
          <PaginationSkeleton />
        </Grid>
      </Grid>
    </Box>
  );
}
