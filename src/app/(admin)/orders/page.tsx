// src/app/(admin)/orders/page.tsx
import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import InboxGrid from '@/features/orders/components/InboxGrid.client';
import { fetchInboxForCurrentUser } from '@/features/orders/services/index.server';

export const revalidate = 0;

export default async function OrdersInboxPage() {
  const { userId, rows } = await fetchInboxForCurrentUser();

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Gelen Kutusu</Typography>

        <InboxGrid initialRows={rows} userId={userId} />
      </Stack>
    </Box>
  );
}
