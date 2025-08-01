'use client';

import { useEffect, useState } from 'react';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { CircularProgress, Box, Typography } from '@mui/material';

import { supabase } from '../../../../lib/supabase/supabaseClient';

type RawRow = {
  system_slug: string;
  users: {
    country: string;
  };
};

type SupabaseRow = {
  system_slug: string;
  users: Array<{ country: string | null }>;
};

export default function CountrySystemRadarChart() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [series, setSeries] = useState<
    { label: string; data: number[] }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('requests')
        .select('system_slug, users ( country )')

      if (error || !data) {
        console.error('Veri alınamadı:', error?.message);
        setLoading(false);
        return;
      }

      const rawData = data as RawRow[];

      // 🔢 Benzersiz sistem slug'ları
      const uniqueSystems = Array.from(
        new Set(rawData.map((row) => row.system_slug))
      );

      // 🔢 { country: { system_slug: count } }
      const grouped: Record<string, Record<string, number>> = {};

      rawData.forEach((row) => {
        const country = row.users?.country || 'Bilinmiyor';
        const system = row.system_slug;

        if (!grouped[country]) {
          grouped[country] = {};
        }

        if (!grouped[country][system]) {
          grouped[country][system] = 1;
        } else {
          grouped[country][system]++;
        }
      });

      // 🔁 Series formatına dönüştür
      const seriesData = Object.entries(grouped).map(
        ([country, systems]) => ({
          label: country,
          data: uniqueSystems.map((s) => systems[s] || 0),
        })
      );

      const systemLabels = uniqueSystems.map((slug) =>
        slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      );

      setMetrics(systemLabels);
      setSeries(seriesData);
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

  if (!series.length) {
    return (
      <Typography color="text.secondary" textAlign="center" py={4}>
        Gösterilecek veri bulunamadı.
      </Typography>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Ülkeye Göre Sistem Talepleri
      </Typography>

      <RadarChart
        height={360}
        series={series}
        radar={{
          max: Math.max(...series.flatMap((s) => s.data)) + 1,
          metrics,
        }}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
      />
    </Box>
  );
}
