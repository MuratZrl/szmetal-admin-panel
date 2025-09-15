// app/requests/[id]/page.tsx
import * as React from 'react';

import { notFound } from 'next/navigation';

import { Box, Grid, Stack } from '@mui/material';

import {
  FormInfoCard,
  SummarySection,
  RequestDetailHeader,
  MaterialListCard,
} from '@/features/requests/components/id';

import {
  fetchRequestByParam,
  buildMaterialRows,
} from '@/features/requests/services/id/request.server';

import UserDetailCard from '@/features/requests/components/id/UserDetailCard.client';
import StatusCard from '@/features/requests/components/id/StatusCard.client';

import { fetchUserPublic } from '@/features/requests/services/id/user.server';

import type { MaterialRow } from '@/features/requests/types';

export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const row = await fetchRequestByParam(id);
  if (!row) return notFound();

  // Kullanıcı bilgisini server’da çek
  const user = row.user_id ? await fetchUserPublic(row.user_id) : null;

  const f = row.form_data;
  const s = row.summary_data[0] ?? null;

  const materialRows: MaterialRow[] = buildMaterialRows(row.material_data);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <RequestDetailHeader id={row.id} systemSlug={row.system_slug} />

      <Grid container spacing={2}>
        {/* Sol kolon: Form + Kullanıcı kartı */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <FormInfoCard form={f} />
            <UserDetailCard user={user} />
          </Stack>
        </Grid>

        {/* Sağ kolon: Özet */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {/* Yeni durum kartı */}
            <StatusCard
              requestId={row.id}
              status={row.status}
            />
            <SummarySection summary={s} />
          </Stack>
        </Grid>

        {/* Alt: Malzeme tablosu */}
        <Grid size={{ xs: 12 }}>
          <MaterialListCard rows={materialRows} />
        </Grid>
      </Grid>
    </Box>
  );
}
