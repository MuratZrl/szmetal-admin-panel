// src/features/systems/SystemsShell.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import StepperComponent from '@/components/ui/stepper/Stepper';
import SystemsGrid from '@/features/create_request/components/SystemsGrid';
import type { SystemCardType } from '@/features/create_request/types/card';
import useSystems from '@/features/create_request/hooks/useSystems';

export default function SystemsShell({ initialSystems }: { initialSystems: SystemCardType[] }) {
  const router = useRouter();
  const { systems, loading, refresh } = useSystems(initialSystems);

  const handleRequest = (slug: string) => router.push(`/create_request/${slug}/step2`);

  return (
    <Box py={2}>
      <Box>
        <StepperComponent activeStep={0} />
      </Box>

      <Box mt={2}>
        <SystemsGrid
          systems={systems}
          loading={loading}
          onRequestClick={handleRequest}
          onRetry={refresh}
        />
      </Box>
    </Box>
  );
}
