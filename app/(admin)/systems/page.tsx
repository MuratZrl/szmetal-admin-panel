// app/(admin)/systems/page.tsx
'use client';

import { useRouter } from "next/navigation";

import { Box, Paper, Grid } from "@mui/material";

import StepperComponent from "../_components_/ui/stepper/Stepper";
import SystemsCard from "../_components_/ui/cards/SystemsCard";

import SystemsCardSkeleton from "../_components_/skeletons/SystemCard";

import { systems } from "../_constants_/systemcards";

const SystemsPage = () => {

  const router = useRouter();

  return (
    <Box sx={{ py: 2 }} >

      <Paper elevation={4} sx={{ width: '100%', p: 2, borderRadius: 7, backgroundColor: '#e7e7e750' }} >

        {/* ******************** 1. Adım ******************** */}
        <StepperComponent activeStep={0} /> 


        {/* ******************** Cardların Grid Yapısı ******************** */}
        <Grid container spacing={2} py={1}>
          {!systems.length ? (
              // Skeletonlar (örneğin 8 tane sahte kart göster)
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

      </Paper>

    </Box>
  );
};

export default SystemsPage;
