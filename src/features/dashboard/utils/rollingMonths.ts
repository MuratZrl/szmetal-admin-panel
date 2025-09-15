// src/features/dashboard/utils/rollingMonths.ts
export type RollingRange = {
  start: Date;      // dahil
  end: Date;        // dahil (şu an)
  startISO: string;
  endISO: string;
  labelTR: string;  // ör: "Ağu 13 – Eyl 13"
};

/** Hedef ayın son gününe göre günü güvenle kısar (31 → 30/29/28 vs). */
function clampToMonthDay(base: Date, monthsBack: number): Date {
  const y = base.getFullYear();
  const m = base.getMonth();
  const d = base.getDate();

  // monthsBack kadar gerideki AYIN son günü kaç?
  // Örn: m-3 ayının son günü: new Date(y, (m-3)+1, 0)
  const lastDayOfTarget = new Date(y, (m - monthsBack) + 1, 0).getDate();
  const day = Math.min(d, lastDayOfTarget);

  const start = new Date(y, m - monthsBack, day, 0, 0, 0, 0);
  return start;
}

export function getRollingMonthRange(monthsBack: number, now = new Date()): RollingRange {
  const end = new Date(now);
  const start = clampToMonthDay(end, monthsBack);

  const fmt = new Intl.DateTimeFormat('tr-TR', { month: 'short', day: '2-digit' });

  return {
    start,
    end,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    labelTR: `${fmt.format(start)} – ${fmt.format(end)}`,
  };
}

export function get3RollingMonthRange(now = new Date()): RollingRange {
  return getRollingMonthRange(2, now);
}

export function get6RollingMonthRange(now = new Date()): RollingRange {
  return getRollingMonthRange(5, now);
}
