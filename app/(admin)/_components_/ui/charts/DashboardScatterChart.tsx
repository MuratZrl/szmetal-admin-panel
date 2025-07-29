// ********************************************************************************
import * as React from 'react';
import { useState, useEffect } from 'react';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
// ********************************************************************************
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../../../types/supabase';

const supabase = createClientComponentClient<Database>();

type Point = {
  system: string;
  userCount: number;
  requestCount: number;
};

export default function ScatterDataset() {

  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const fetchData = async () => {

      // 1. Tüm talepler
      const { data: requests } = await supabase
        .from('requests')
        .select('id, system_slug, created_by');

      if (!requests) return;

      // 2. Sistem slug'lara göre grupla
      const systemMap = new Map<string, { users: Set<string>; requests: number }>();

      requests.forEach((req) => {
        const slug = req.system_slug;
        const user = req.created_by;
        if (!systemMap.has(slug)) {
          systemMap.set(slug, { users: new Set(), requests: 0 });
        }
        systemMap.get(slug)!.users.add(user);
        systemMap.get(slug)!.requests += 1;
      });

      // 3. Scatter Chart için veri üret
      const result: Point[] = Array.from(systemMap.entries()).map(([slug, { users, requests }]) => ({
        system: slug,
        userCount: users.size,
        requestCount: requests,
      }));

      setPoints(result);
    };

    fetchData();
  }, []);

  return (
    <ScatterChart
      height={300}
      dataset={points.map((p, i) => ({
        id: p.system,
        x: p.userCount,
        y: p.requestCount,
      }))}
      series={[
        {
          label: 'Sistem Kullanımı',
          valueFormatter: (v: number | null) => (v ?? 0).toString(),
        },
      ]}
      xAxis={[{ label: 'Kullanıcı Sayısı' }]}
      yAxis={[{ label: 'Talep Sayısı' }]}
      grid={{ vertical: true, horizontal: true }}
    />
  );
}