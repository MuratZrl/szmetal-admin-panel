// src/features/dashboard/services/subchart3.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import { lastNMonthsAnchored, monthDayLabelTR, monthKeyYYYYMM } from '@/features/dashboard/utils/anchoredMonths';

export type GroupBarSeries = { key: string; label: string; data: number[] };
export type GroupBarData = { labels: string[]; series: GroupBarSeries[] };

type ReqRow = { created_at: string; user_id: string | null };
type UserRow = { id: string; country: string | null };

// Basit TR title-case (ülke adı zaten düzgünse dokunmaz)
function capTR(word: string): string {
  if (!word) return word;
  const lower = word.toLocaleLowerCase('tr-TR');
  const first = lower.charAt(0).toLocaleUpperCase('tr-TR');
  return first + lower.slice(1);
}
function humanizeCountry(name: string | null | undefined): string {
  const v = (name ?? '').trim();
  if (!v) return 'Bilinmiyor';
  // “türkiye cumhuriyeti” → “Türkiye Cumhuriyeti”
  return v.split(/\s+/).map(capTR).join(' ');
}

type Options = { topK?: number };

export async function fetchRequestsByCountryGroup3M(opts: Options = {}): Promise<GroupBarData> {
  const topK = Math.max(1, opts.topK ?? 6);
  const supabase = await createSupabaseServerClient();

  // 1) Ay listesi: bugünün gününe ankore (ör. 13 ise 13)
  const months = lastNMonthsAnchored(3);
  const monthKeys = months.map(m => monthKeyYYYYMM(m));
  const fromISO = new Date(months[0].getFullYear(), months[0].getMonth(), 1).toISOString();

  // 2) Son 3 ay istekler
  const { data: reqRows, error: reqErr } = await supabase
    .from('requests')
    .select('created_at, user_id')
    .gte('created_at', fromISO) as { data: ReqRow[] | null; error: unknown };
  if (reqErr) throw reqErr;

  const rows = (reqRows ?? []).filter(r => !!r.created_at);
  if (rows.length === 0) {
    return { labels: months.map(monthDayLabelTR), series: [] };
  }

  // 3) Kullanıcı ülkeleri
  const userIds = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean))) as string[];
  let countriesByUser = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: userRows, error: userErr } = await supabase
      .from('users') // tablo adın farklıysa düzelt
      .select('id, country')
      .in('id', userIds) as { data: UserRow[] | null; error: unknown };
    if (userErr) throw userErr;

    countriesByUser = new Map(
      (userRows ?? []).map(u => [u.id, humanizeCountry(u.country)]),
    );
  }

  // 4) Ay x Ülke sayımları
  const counts = new Map<string, Map<string, number>>(); // mk -> country -> count
  for (const mk of monthKeys) counts.set(mk, new Map());

  for (const r of rows) {
    const dt = new Date(r.created_at);
    const mk = monthKeyYYYYMM(new Date(dt.getFullYear(), dt.getMonth(), 1));
    if (!counts.has(mk)) continue;

    const country = r.user_id ? (countriesByUser.get(r.user_id) ?? 'Bilinmiyor') : 'Bilinmiyor';
    const bucket = counts.get(mk)!;
    bucket.set(country, (bucket.get(country) ?? 0) + 1);
  }

  // 5) En popüler ülkeler + “Diğer”
  const totalByCountry = new Map<string, number>();
  for (const mk of monthKeys) {
    for (const [c, n] of counts.get(mk)!) totalByCountry.set(c, (totalByCountry.get(c) ?? 0) + n);
  }
  const sortedCountries = Array.from(totalByCountry.entries()).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  const picked = sortedCountries.slice(0, topK);
  const others = new Set(sortedCountries.slice(topK));
  const finalCountries = [...picked, ...(others.size ? ['Diğer'] : [])];

  // 6) Seriler
  const labels = months.map(monthDayLabelTR); // “Tem 13”, “Ağu 13”, “Eyl 13”
  const series: GroupBarSeries[] = finalCountries.map(c => ({
    key: c,
    label: c, // “Diğer” dahil
    data: monthKeys.map(mk => {
      const bucket = counts.get(mk)!;
      if (c === 'Diğer') {
        let sum = 0;
        for (const [cc, val] of bucket) if (!picked.includes(cc)) sum += val;
        return sum;
      }
      return bucket.get(c) ?? 0;
    }),
  }));

  return { labels, series };
}
