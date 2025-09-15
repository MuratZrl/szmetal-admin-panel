// src/features/clients/services/chart.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type ClientsLine6M = {
  labels: string[];            // ör: ["13 Nis ‘25","13 May ‘25", ...]
  totalUsers: number[];        // cutoff öncesi toplam kullanıcı
  totalActiveUsers: number[];  // cutoff öncesi toplam aktif kullanıcı (status='Active')
};

const IST_TZ = 'Europe/Istanbul';
const IST_OFFSET_MIN = 180; // UTC+3 kalıcı

// Belirli bir UTC Date'i, verilen timeZone'a göre Y/M/D döndür
function getZonedYMD(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(date);
  const y = Number(parts.find(p => p.type === 'year')?.value ?? '1970');
  const m = Number(parts.find(p => p.type === 'month')?.value ?? '01');
  const d = Number(parts.find(p => p.type === 'day')?.value ?? '01');
  return { y, m, d };
}

// Ay ekle (clamp: hedef ayın son gününü aşma)
function addMonthsClamp(y: number, m: number, d: number, delta: number): { y: number; m: number; d: number } {
  const idx = (m - 1) + delta;
  const y2 = y + Math.floor(idx / 12);
  const m2 = ((idx % 12) + 12) % 12 + 1; // 1..12
  const dim = daysInMonthUTC(y2, m2);
  const d2 = Math.min(d, dim);
  return { y: y2, m: m2, d: d2 };
}

// UTC'te bir ayın gün sayısı (timezone’dan bağımsız)
function daysInMonthUTC(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1..12, 0 = prev month's last day
}

// Europe/Istanbul’da Y-M-D 00:00’ın denk geldiği UTC ISO anı
function istMidnightToUTCISO(y: number, m: number, d: number): string {
  // Yerel 00:00 (UTC+3) => UTC: önceki gün 21:00
  const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0);
  const adjusted = utcMs - IST_OFFSET_MIN * 60_000;
  return new Date(adjusted).toISOString();
}

// Etiket formatı: "13 Nis ‘25"
const labelFmt = new Intl.DateTimeFormat('tr-TR', {
  timeZone: IST_TZ,
  day: '2-digit',
  month: 'short',
});

// Bugünkü gün-of-month’a hizalı son N cutoff’larını üret
function getLastNAnchoredCutoffs(n: number): { y: number; m: number; d: number; iso: string; label: string }[] {
  const now = new Date();
  const { y, m, d } = getZonedYMD(now, IST_TZ); // İstanbul’daki bugünkü Y/M/D

  const items: { y: number; m: number; d: number; iso: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const t = addMonthsClamp(y, m, d, -i);
    const iso = istMidnightToUTCISO(t.y, t.m, t.d);
    // Etiketi oluşturmak için UTC’te öğlen saatine al ki local format güvenli olsun
    const noonUTC = new Date(Date.UTC(t.y, t.m - 1, t.d, 12, 0, 0));
    const label = labelFmt.format(noonUTC); // "13 Nis 2025" tarzı, yıl kısaltmalı
    items.push({ ...t, iso, label });
  }
  return items;
}

/**
 * Son 6 ay, bugünkü gün-of-month’a hizalı (ör. bugün 13 ise: Nis 13..Eyl 13) “as-of” toplamlar.
 * Her nokta, ilgili tarihin 00:00 (IST) anına kadarki toplamı gösterir.
 */
export async function fetchClientsLine6M(): Promise<ClientsLine6M> {
  const supabase = await createSupabaseServerClient();

  const cutoffs = getLastNAnchoredCutoffs(6); // 6 adet cutoff
  const labels = cutoffs.map(c => c.label);

  // Toplamlar: created_at < cutoff
  const totalQueries = cutoffs.map(c =>
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', c.iso)
  );

  const activeQueries = cutoffs.map(c =>
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Active')
      .lt('created_at', c.iso)
  );

  const [totalResArr, activeResArr] = await Promise.all([
    Promise.all(totalQueries),
    Promise.all(activeQueries),
  ]);

  totalResArr.forEach((r, i) => { if (r.error) console.error('clients line total idx', i, r.error); });
  activeResArr.forEach((r, i) => { if (r.error) console.error('clients line active idx', i, r.error); });

  const totalUsers = totalResArr.map(r => Number.isFinite(r.count as number) ? (r.count as number) : 0);
  const totalActiveUsers = activeResArr.map(r => Number.isFinite(r.count as number) ? (r.count as number) : 0);

  return { labels, totalUsers, totalActiveUsers };
}
