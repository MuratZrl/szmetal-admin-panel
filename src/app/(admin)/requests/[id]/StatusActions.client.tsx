// app/(admin)/requests/[id]/StatusActions.client.tsx
'use client';

import * as React from 'react';
import { Button, Grid } from '@mui/material';
import type { RequestStatus } from '@/features/requests/services/requests_id.server';

type Props = {
  requestId: string;
  status: RequestStatus;
  action: (input: { id: string; status: RequestStatus }) => Promise<void>;
};

export default function StatusActions({ requestId, status, action }: Props) {
  const [pending, startTransition] = React.useTransition();

  if (status !== 'pending') return null;

  return (
    <Grid container spacing={2} justifyContent={{ xs: 'center', sm: 'flex-end' }} mt={1}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Button
          variant="contained"
          disabled={pending}
          onClick={() => startTransition(() => action({ id: requestId, status: 'approved' }))}
          sx={{
            px: 4, py: 1, width: '100%', backgroundColor: 'green',
            textTransform: 'capitalize', borderRadius: 7, '&:hover': { backgroundColor: 'darkgreen' }
          }}
        >
          Onayla
        </Button>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Button
          variant="contained"
          disabled={pending}
          onClick={() => startTransition(() => action({ id: requestId, status: 'rejected' }))}
          sx={{
            px: 4, py: 1, width: '100%', backgroundColor: 'orangered',
            textTransform: 'capitalize', borderRadius: 7, '&:hover': { backgroundColor: 'darkred' }
          }}
        >
          Reddet
        </Button>
      </Grid>
    </Grid>
  );
}
