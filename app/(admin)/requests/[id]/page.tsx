'use client';

import { useEffect, useState } from 'react';

import { useParams, notFound } from 'next/navigation';

import { Typography, CircularProgress, Box, Card, CardContent, Grid, Paper, Chip, Divider, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';

import GiyotinTables from '../../_components_/requests-system-data/GiyotinTables';
import { RequestRowUnion } from '../../types/requestsTypes';

import { supabase } from '../../../lib/supabase/supabaseClient';

function renderSystemTables(request: RequestRowUnion) {
  switch (request.system_slug) {

    case 'giyotin-sistemi':
      return (
        <GiyotinTables
          summaryData={request.summary_data}
          materialData={request.material_data}
        />
      );
      
    default:
      return <Typography>Tanımsız sistem.</Typography>;
  }
}

export default function RequestDetailPage() {
  const { id } = useParams() as { id: string };

  const [request, setRequest] = useState<RequestRowUnion | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const updateStatus = async (newStatus: 'approved' | 'rejected') => {
    setUpdating(true);

    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setRequest((prev) => prev ? { ...prev, status: newStatus } : prev);
    } else {
      console.error('Durum güncelleme hatası:', error.message);
    }

    setUpdating(false);
  };

  useEffect(() => {
    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          users (
            username,
            email,
            company
          )
        `)
        .eq('id', id)
        .single();


      if (error || !data) {
        notFound();
      } else {
        setRequest(data as RequestRowUnion);
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <Box className="flex justify-center py-10">
        <CircularProgress />
      </Box>
    );
  }

  if (!request) return null;

  return (
    <Box sx={{ py: 4, px: 2 }} >

      <Paper elevation={1} sx={{ width: '100%', p: 2, borderRadius: 7 }} >

        <Card variant="outlined" sx={{ mb: 4, borderRadius: 5, boxShadow: 2 }} >

          <CardContent>

            <Grid container spacing={2} >
              <Grid size={{ xs: 12, sm: 6 }} >
                <Typography>
                  <strong>Durum:</strong>{' '}
                  <Chip
                    label={
                      <span className="flex items-center gap-1">
                        {request.status === 'approved' && <CheckCircleIcon sx={{ fontSize: 16 }} />}
                        {request.status === 'pending' && <HourglassTopIcon sx={{ fontSize: 16 }} />}
                        {request.status === 'rejected' && <CancelIcon sx={{ fontSize: 16 }} />}
                        {
                          request.status === 'approved' ? 'Onaylandı' :
                          request.status === 'pending' ? 'Bekleyen' :
                          'Reddedildi'
                        }
                      </span>
                    }
                    color={
                      request.status === 'approved'
                        ? 'success'
                        : request.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                    variant="outlined"
                  />
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} >
                <Typography>
                  <strong>Oluşturulma Tarihi:</strong>{' '}
                  {new Date(request.created_at).toLocaleString('tr-TR', {
                    timeZone: 'Europe/Istanbul',
                  })}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} >
                <Typography>
                  <strong>Kullanıcı:</strong> {request.users?.username ?? '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} >
                <Typography>
                  <strong>Şirket / Firma:</strong> {request.users?.company ?? '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }} >
                <Typography>
                  <strong>E-posta:</strong> {request.users?.email ?? '—'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {request.status === 'pending' && (
              <Grid container spacing={1} justifyContent="flex-end" >
                <Grid >
                  <Button
                    variant="contained"
                    onClick={() => updateStatus('approved')}
                    disabled={updating}
                    sx={{
                      px: 3,
                      py: 1,
                      backgroundColor: 'green',
                      textTransform: 'capitalize',

                      borderRadius: 7,

                      '&:hover': {
                        backgroundColor: 'darkgreen'
                      }
                    }}
                  >
                    Onayla
                  </Button>
                </Grid>
                <Grid >
                  <Button
                    variant="contained"
                    onClick={() => updateStatus('rejected')}
                    disabled={updating}
                    sx={{
                      px: 3,
                      py: 1,
                      backgroundColor: 'orangered',
                      textTransform: 'capitalize',

                      borderRadius: 7,

                      '&:hover': {
                        backgroundColor: 'darkred'
                      }
                    }}
                  >
                    Reddet
                  </Button>
                </Grid>
              </Grid>
            )}

          </CardContent>

        </Card>

        <Divider sx={{ my: 2 }} />

        {/* Detayları renderla */}
        {renderSystemTables(request)}
      </Paper>

    </Box>
  );
}
