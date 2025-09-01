// src/features/dashboard/components/ChartSection.client.tsx
"use client";

import { Card, Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import * as React from "react";

export default function ChartSection({
  items,
}: {
  items: { title: string; Component: React.ComponentType }[];
}) {
  return (
    <Grid container spacing={2} mt={2}>
      {items.map(({ title, Component }, idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: items.length >= 3 ? 4 : 6 }}>
          <Card sx={{ p: 2, borderRadius: 7 }}>
            <Typography variant="subtitle1" fontWeight={600} px={2}>
              {title}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Component />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
