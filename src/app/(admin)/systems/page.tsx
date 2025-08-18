// app/(admin)/systems/page.tsx
'use client';
// ****************************************************************************************************
import { useRouter } from 'next/navigation';
// ****************************************************************************************************
import { Box, Grid } from '@mui/material';
// ****************************************************************************************************
import StepperComponent from '@/components/ui/stepper/Stepper';
import SystemsCard from '@/components/ui/cards/SystemsCard';
// ****************************************************************************************************
import SystemsCardSkeleton from '@/components/skeletons/SystemCard';
// ****************************************************************************************************
import { systems } from '@/constants/systemcards';
// ****************************************************************************************************
const SystemsPage = () => {
  const router = useRouter();

  return (
    <Box  py={2} >

        {/* ******************** 1. Adım ******************** */}
        <Box >
          <StepperComponent activeStep={0} />
        </Box>

        {/* ******************** Kartlar ******************** */}
        <Grid container spacing={2}>
          {!systems.length ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <SystemsCardSkeleton />
              </Grid>
            ))
          ) : (
            systems.map((system, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <SystemsCard
                  imageUrl={system.imageUrl}
                  title={system.title}
                  description={system.description}
                  tag={system.tag}
                  buttonLabels={system.buttonLabels}
                  onRequestClick={() => {
                    const slug = system.links.requestPage.split('/systems/')[1];
                    router.push(`/systems/${slug}/step2`);
                  }}
                />
              </Grid>
            ))
          )}
        </Grid>

    </Box>
  );
};

export default SystemsPage;
