// src/features/dashboard/utils/anchoredMonths.ts
export function lastNMonthsAnchored(n: number, now = new Date()): Date[] {
  const end = new Date(now);
  const y = end.getFullYear();
  const m = end.getMonth();
  const d = end.getDate();

  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const targetLastDay = new Date(y, (m - i) + 1, 0).getDate(); // hedef ayın son günü
    const day = Math.min(d, targetLastDay);                      // 31 → 30/29/28 kısalt
    out.push(new Date(y, m - i, day, 0, 0, 0, 0));
  }
  return out;
}

export function monthDayLabelTR(d: Date): string {
  return d.toLocaleDateString('tr-TR', { month: 'short', day: '2-digit' }); // "Eyl 13"
}

export function monthKeyYYYYMM(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // "2025-09"
}
