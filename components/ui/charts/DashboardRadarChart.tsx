'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { supabase } from '../../../lib/supabase/supabaseClient';

type SupabaseRawRow = {
  system_slug: string;
  users: { country: string | null };
};

type DatasetRow = {
  country: string;
  [system_slug: string]: number | string;
};

export default function CountrySystemBarChart() {
  const [dataset, setDataset] = useState<DatasetRow[]>([]);
  const [seriesKeys, setSeriesKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          system_slug,
          users:users (
            country
          )
        `);

      if (error || !data) {
        console.error('Veri alınamadı:', error?.message);
        setLoading(false);
        return;
      }

      const typedData = (data as unknown) as SupabaseRawRow[];

      const cleanRows = typedData.map((row) => ({
        system_slug: row.system_slug,
        country: row.users?.country ?? 'Bilinmiyor',
      }));

      const grouped: Record<string, Record<string, number>> = {};
      const systemSet = new Set<string>();

      cleanRows.forEach(({ country, system_slug }) => {
        systemSet.add(system_slug);
        if (!grouped[country]) grouped[country] = {};
        grouped[country][system_slug] = (grouped[country][system_slug] || 0) + 1;
      });

      const systemKeys = Array.from(systemSet);

      const finalDataset: DatasetRow[] = Object.entries(grouped).map(([country, systems]) => {
        const row: DatasetRow = { country };
        systemKeys.forEach((key) => {
          row[key] = systems[key] || 0;
        });
        return row;
      });

      setSeriesKeys(systemKeys);
      setDataset(finalDataset);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dataset.length) {
    return (
      <Typography color="text.secondary" textAlign="center" py={4}>
        Gösterilecek veri bulunamadı.
      </Typography>
    );
  }

  return (
    <Box style={{ width: '100%' }} >

      <BarChart
        dataset={dataset}
        xAxis={[{ scaleType: 'band', dataKey: 'country' }]}
        series={seriesKeys.map((key) => ({
          dataKey: key,
          label: key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        }))}
        height={300}
        margin={{ top: 20, bottom: 30, left: 50, right: 20 }}
        yAxis={[
          {
            label: 'Talep Sayısı',
            valueFormatter: (v: number) => `${v}`,
          },
        ]}
      />

    </Box>
  );
}
