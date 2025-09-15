// src/features/dashboard/services/subchart2.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import { STATUS_LABELS_TR } from '@/features/dashboard/constants/status';

export type PieItem = { label: string; value: number; color?: string };
export type PieData = { items: PieItem[] };

type RawRow = { status: string | null };
type KnownStatus = 'pending' | 'approved' | 'rejected';

const KNOWN: KnownStatus[] = ['pending', 'approved', 'rejected'];

export async function fetchRequestsStatusPieAllTime(): Promise<PieData> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('requests')
    .select('status') as { data: RawRow[] | null; error: unknown };

  if (error) throw error;

  const counters: Record<KnownStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  let unknown = 0;

  for (const r of data ?? []) {
    const s = (r.status ?? '').toLowerCase();
    if (KNOWN.includes(s as KnownStatus)) {
      counters[s as KnownStatus] += 1;
    } else {
      unknown += 1;
    }
  }

  const items: PieItem[] = [
    { label: STATUS_LABELS_TR.pending,  value: counters.pending },
    { label: STATUS_LABELS_TR.approved, value: counters.approved },
    { label: STATUS_LABELS_TR.rejected, value: counters.rejected },
  ];

  if (unknown > 0) {
    items.push({ label: 'diğer', value: unknown });
  }

  return { items };
}

/*
Performans notu (opsiyonel, büyük tabloda iyi fikir):
-- Gruplanmış bir view ile DB tarafında say:
create or replace view public.requests_status_counts as
select lower(status) as status, count(*)::bigint as cnt
from public.requests
group by 1;

-- Sonra:
const { data } = await supabase.from('requests_status_counts').select('status, cnt');
*/
