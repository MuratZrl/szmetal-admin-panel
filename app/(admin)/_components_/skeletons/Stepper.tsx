'use client';

import React from 'react';
import { Box, Card, Grid, Skeleton } from '@mui/material';

const StepperSkeleton = () => {
  return (
    <Box
      sx={{
        width: '100%',
        mx: 'auto',
        px: { xs: 1, sm: 2 },
        py: { xs: 1, sm: 2 },
      }}
    >
      <Card
        sx={{
          px: { xs: 1, sm: 2 },
          py: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          boxShadow: 0.25,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {[1, 2, 3].map((_, index) => (
            <Grid key={index} size={{ xs: 12 }} >
              <Box display="flex" flexDirection="column" alignItems="center">
                {/* Daire (icon) */}
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ mb: 0.5 }}
                />

                {/* Label */}
                <Skeleton variant="text" width="80%" height={16} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
};

export default StepperSkeleton;
