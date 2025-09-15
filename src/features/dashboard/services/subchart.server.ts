// src/features/dashboard/services/subchart.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import { lastNMonthsAnchored, monthDayLabelTR, monthKeyYYYYMM } from '@/features/dashboard/utils/anchoredMonths';

export type GroupBarSeries = { key: string; label: string; data: number[] };
export type GroupBarData = { labels: string[]; series: GroupBarSeries[] };

type RequestRow = { created_at: string; system_slug: string | null };

/* ↓↓↓ EKLE: slug → başlık (TR locale), akronimleri korur ↓↓↓ */
const ACRONYMS = new Set([
  'api','sms','erp','crm','sql','http','https','pdf','xml','csv','tls','ssl','sso','ui','ux','qa','cdn'
]);

function capTR(word: string): string {
  if (!word) return word;
  const lower = word.toLocaleLowerCase('tr-TR');
  const first = lower.charAt(0).toLocaleUpperCase('tr-TR');
  return first + lower.slice(1);
}

function humanizeSlug(slug: string): string {
  if (!slug || slug === 'unknown') return 'Bilinmiyor';
  // kebab, snake, nokta vs. her şeye böl
  const parts = slug.split(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]+/).filter(Boolean);
  return parts
    .map(p => (ACRONYMS.has(p.toLowerCase()) ? p.toUpperCase() : capTR(p)))
    .join(' ');
}
/* ↑↑↑ EKLE ↑↑↑ */

type Options = { topK?: number };

export async function fetchRequestsBySystemGroup3M(opts: Options = {}): Promise<GroupBarData> {
  const topK = Math.max(1, opts.topK ?? 5);
  const supabase = await createSupabaseServerClient();

  const months = lastNMonthsAnchored(3);
  const monthKeys = months.map(m => monthKeyYYYYMM(m));

  const fromISO = new Date(months[0].getFullYear(), months[0].getMonth(), 1).toISOString();

  const { data, error } = await supabase
    .from('requests')
    .select('created_at, system_slug')
    .gte('created_at', fromISO) as { data: RequestRow[] | null; error: unknown };
  if (error) throw error;

  const rows = (data ?? []).map(r => ({
    created_at: r.created_at,
    system_slug: r.system_slug ?? 'unknown',
  }));

  const totalBySystem = new Map<string, number>();
  for (const r of rows) totalBySystem.set(r.system_slug, (totalBySystem.get(r.system_slug) ?? 0) + 1);

  const sortedSystems = Array.from(totalBySystem.entries()).sort((a, b) => b[1] - a[1]).map(([s]) => s);
  const picked = sortedSystems.slice(0, topK);
  const others = new Set(sortedSystems.slice(topK));

  const counts = new Map<string, Map<string, number>>();
  for (const mk of monthKeys) counts.set(mk, new Map());

  for (const r of rows) {
    const dt = new Date(r.created_at);
    const mk = monthKeyYYYYMM(new Date(dt.getFullYear(), dt.getMonth(), 1));
    if (!counts.has(mk)) continue;
    const sys = others.has(r.system_slug) ? 'other' : r.system_slug;
    const bucket = counts.get(mk)!;
    bucket.set(sys, (bucket.get(sys) ?? 0) + 1);
  }

  const systemsFinal = [...picked, ...(others.size ? ['other'] : [])];
  const labels = months.map(monthDayLabelTR); // ← "Tem 13", "Ağu 13", "Eyl 13"

  const series: GroupBarSeries[] = systemsFinal.map(sys => ({
    key: sys,
    label: sys === 'other' ? 'Diğer' : humanizeSlug(sys),
    data: monthKeys.map(mk => counts.get(mk)?.get(sys) ?? 0),
  }));

  return { labels, series };
}
