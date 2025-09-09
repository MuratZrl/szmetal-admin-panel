// app/(admin)/requests/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Box, Card, CardContent, Chip, Divider, Grid, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';

import StatusActions from '@/app/(admin)/requests/[id]/StatusActions.client';
import { fetchRequestById } from '@/features/requests/services/requests_id.server';
import { updateRequestStatusAction } from './actions';
import GiyotinTables from '@/features/create_request/components/GiyotinTables.client';
import type { RequestRowUnion } from '@/features/requests/types';

export const dynamic = 'force-dynamic';

type PageParams = { id: string };
type PageProps = { params: Promise<PageParams> };

function StatusChip({ status }: { status: RequestRowUnion['status'] }) {
  const icon =
    status === 'approved' ? <CheckCircleIcon sx={{ fontSize: 16 }} /> :
    status === 'pending'  ? <HourglassTopIcon sx={{ fontSize: 16 }} /> :
                            <CancelIcon sx={{ fontSize: 16 }} />;

  const label =
    status === 'approved' ? 'Onaylandı' :
    status === 'pending'  ? 'Bekleyen'  :
                            'Reddedildi';

  const color: 'success' | 'warning' | 'error' =
    status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'error';

  return (
    <Chip
      label={<Box component="span" display="flex" alignItems="center" gap={1}>{icon}{label}</Box>}
      color={color}
      size="small"
      variant="outlined"
    />
  );
}

function renderSystemTables(req: RequestRowUnion) {
  switch (req.system_slug) {
    case 'giyotin-sistemi':
      return (
        <GiyotinTables
          summaryData={req.summary_data}
          materialData={req.material_data}
        />
      );
    default:
      return <Typography>Tanımsız sistem.</Typography>;
  }
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;              // <-- kritik: params Promise
  const idStr = String(id);

  // ID numerik ise:
  if (!/^\d+$/.test(idStr)) notFound();

  // ID uuid ise yukarıdakini kaldırıp istersen şu kontrolü kullan:
  // if (!/^[0-9a-f-]{36}$/i.test(idStr)) notFound();

  const request = await fetchRequestById(idStr);
  if (!request) notFound();

  return (
    <Box sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2 } }}>
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 5, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={1.25}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><strong>Durum:</strong> <StatusChip status={request.status} /></Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><strong>Proje Adı:</strong> {request.description ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><strong>Kullanıcı:</strong> {request.users?.username ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><strong>Şirket / Firma:</strong> {request.users?.company ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><strong>E-posta:</strong> {request.users?.email ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><strong>Ülke:</strong> {request.users?.country ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography>
                <strong>Oluşturulma Tarihi:</strong>{' '}
                {new Date(request.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <StatusActions
            requestId={request.id}
            status={request.status}
            action={updateRequestStatusAction}
          />
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {renderSystemTables(request)}
    </Box>
  );
}
