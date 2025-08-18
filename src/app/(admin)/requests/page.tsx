// app/(admin)/requests/page.tsx
import React from 'react';
import { Box } from '@mui/material';

import RequestStats from '@/components/ui/requests/RequestsStats';
import RequestsDataGrid from '@/components/ui/requests/RequestsDataGrid';
import RequestsCharts from '@/components/ui/requests/RequestsCharts';

import { fetchAllRequests } from '@/services/requests.server';
import type { RequestRowUnion } from '@/types/requests';

export const revalidate = 60;

export default async function Page() {
  let rows: RequestRowUnion[] = [];

  try {
    rows = await fetchAllRequests();
  } catch (err) {
    console.error('fetchAllRequests failed', err);
    return (
      <Box px={2} py={4}>
        <h2>Veri alınırken hata oluştu</h2>
        <p>Sunucu hatası: {(err as Error)?.message ?? 'Bilinmeyen hata'}</p>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 2, sm: 4 } }}>
      <RequestStats rows={rows} />
      <RequestsDataGrid rows={rows} />
      <RequestsCharts rows={rows} />
    </Box>
  );
}
