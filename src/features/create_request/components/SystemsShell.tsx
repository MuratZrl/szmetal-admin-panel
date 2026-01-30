'use client';
// src/features/create_request/components/SystemsShell.client.tsx

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { Route } from 'next';

import StepperComponent from '@/components/ui/stepper/Stepper';
import SystemCard from '@/features/create_request/components/SystemCard.client';
import SystemCardSkeleton from '@/features/create_request/components/SystemCardSkeleton.client';
import useSystems from '@/features/create_request/hooks/useSystems';
import type { SystemCardType } from '@/features/create_request/types/card';

type SystemsShellProps = { initialSystems: SystemCardType[] };

export default function SystemsShell({ initialSystems }: SystemsShellProps) {
  const router = useRouter();
  const { systems, loading, refresh } = useSystems(initialSystems);

  const goStep2 = React.useCallback((slug: string) => {
    const href = `/create_request/${slug}/step2` as Route; // Typed Routes ile barış
    router.push(href);
  }, [router]);

  // Grid v2: size objesi sadece ITEM'larda kullanılır
  const itemSize = React.useMemo(() => ({ xs: 12, sm: 6, md: 4 } as const), []);
  const skeletons = React.useMemo(() => Array.from({ length: 8 }), []);
  const justify = systems?.length === 1 ? 'flex-start' : 'flex-start';

  return (
    <Box px={1}>
      <Box>
        <StepperComponent activeStep={0} />
      </Box>

      <Box>
        {loading ? (
          <Grid container spacing={2} justifyContent={justify} sx={{ width: '100%' }}>
            {skeletons.map((_, i) => (
              <Grid key={i} size={itemSize}>
                <SystemCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : !systems || systems.length === 0 ? (
          <Box
            sx={{
              px: 2,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Hiç sistem bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ya gerçekten yok, ya da RLS politikaların okuma izni vermiyor.
            </Typography>
            {refresh && (
              <Button variant="outlined" onClick={refresh}>
                Yeniden Dene
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2} justifyContent={justify} sx={{ width: '100%' }}>
            {systems.map((s) => (
              <Grid key={s.id} size={itemSize}>
                <SystemCard
                  {...s}
                  tags={s.tag ? [s.tag] : []}
                  onRequestClick={() => goStep2(s.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
