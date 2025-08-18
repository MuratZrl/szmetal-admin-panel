// src/features/systems/SystemsShell.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';

import StepperComponent from '@/components/ui/stepper/Stepper';
import SystemsGrid from '@/components/ui/systems/SystemsGrid';
import type { SystemCardType } from '@/types/systems';

export default function SystemsShell({ initialSystems }: { initialSystems: SystemCardType[] }) {
  const router = useRouter();

  const handleRequest = (slug: string) => {
    // centralize navigation logic so components stay dumb
    router.push(`/systems/${slug}/step2`);
  };

  return (
    <Box py={2}>
      <Box>
        <StepperComponent activeStep={0} />
      </Box>

      <Box mt={2}>
        <SystemsGrid systems={initialSystems} onRequestClick={handleRequest} />
      </Box>
    </Box>
  );
}
