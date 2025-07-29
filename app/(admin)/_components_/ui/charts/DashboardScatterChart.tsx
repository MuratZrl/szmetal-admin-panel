'use client';

import { useEffect, useState } from 'react';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../../../types/supabase';

const supabase = createClientComponentClient<Database>();

type Point = {
  system: string;
  userCount: number;
  requestCount: number;
};

type RequestRow = Database['public']['Tables']['requests']['Row'];

export default function ScatterDataset() {
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('user_id, system_slug');

      if (error) {
        console.error('Supabase Error:', error.message);
        return;
      }

      console.log('Supabase Request Data:', data);

      const requests = data as RequestRow[];
      if (!requests) return;

      const systemMap = new Map<string, { users: Set<string>; requests: number }>();

      for (const req of requests) {
        const slug = req.system_slug;
        const user = req.user_id;

        if (!slug || !user) continue;

        if (!systemMap.has(slug)) {
          systemMap.set(slug, { users: new Set(), requests: 0 });
        }
        systemMap.get(slug)!.users.add(user);
        systemMap.get(slug)!.requests += 1;
      }

      const result: Point[] = Array.from(systemMap.entries()).map(([slug, { users, requests }]) => ({
        system: slug,
        userCount: users.size,
        requestCount: requests,
      }));

      console.log('Processed Points:', result);
      setPoints(result);
    };

    fetchData();
  }, []);

  return (
    <ScatterChart
      height={300}
      dataset={points.map((p) => ({
        id: p.system,
        x: p.userCount ?? 0,
        y: p.requestCount ?? 0,
        label: p.system,
      }))}
      series={[
        {
          label: 'Sistem Kullanımı',
        },
      ]}
      xAxis={[{ label: 'Kullanıcı Sayısı' }]}
      yAxis={[{ label: 'Talep Sayısı' }]}
      grid={{ vertical: true, horizontal: true }}
    />
  );
}
