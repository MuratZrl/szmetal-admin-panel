// src/features/dashboard/utils/dateRanges.ts
import type {
  DateRangeKey,
  DateRange,
  BucketStrategy,
  DateRangeConfig,
} from '../types/dashboardData';

// ─── Turkish Day / Month Labels ───────────────────────────
const MONTH_SHORT_TR = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

const DAY_SHORT_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

// ─── Helpers ──────────────────────────────────────────────
function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function startOfWeekUTC(d: Date): Date {
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ... 6=Sat
  const diff = day === 0 ? 6 : day - 1; // distance from Monday
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
  return monday;
}

function startOfMonthUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function startOfYearUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}

function formatDateTR(d: Date): string {
  return `${d.getUTCDate()} ${MONTH_SHORT_TR[d.getUTCMonth()]}`;
}

function formatMonthYearTR(d: Date): string {
  return `${MONTH_SHORT_TR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// ─── getDateRangeConfig ───────────────────────────────────
export function getDateRangeConfig(key: DateRangeKey): DateRangeConfig {
  const now = new Date();
  const nowISO = now.toISOString();

  switch (key) {
    case 'today': {
      const start = startOfDayUTC(now);
      const prevStart = new Date(start.getTime() - 86_400_000); // yesterday
      return {
        key,
        label: 'Bugün',
        range: { startISO: start.toISOString(), endISO: nowISO },
        previousRange: { startISO: prevStart.toISOString(), endISO: start.toISOString() },
        bucketStrategy: 'hourly',
        timeLabel: formatDateTR(now),
      };
    }

    case 'thisWeek': {
      const start = startOfWeekUTC(now);
      const prevStart = new Date(start.getTime() - 7 * 86_400_000);
      return {
        key,
        label: 'Bu Hafta',
        range: { startISO: start.toISOString(), endISO: nowISO },
        previousRange: { startISO: prevStart.toISOString(), endISO: start.toISOString() },
        bucketStrategy: 'daily',
        timeLabel: `${formatDateTR(start)} – ${formatDateTR(now)}`,
      };
    }

    case 'thisMonth': {
      const start = startOfMonthUTC(now);
      const prevStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      return {
        key,
        label: 'Bu Ay',
        range: { startISO: start.toISOString(), endISO: nowISO },
        previousRange: { startISO: prevStart.toISOString(), endISO: start.toISOString() },
        bucketStrategy: 'daily',
        timeLabel: `${formatDateTR(start)} – ${formatDateTR(now)}`,
      };
    }

    case 'thisYear': {
      const start = startOfYearUTC(now);
      const prevStart = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
      return {
        key,
        label: 'Bu Yıl',
        range: { startISO: start.toISOString(), endISO: nowISO },
        previousRange: { startISO: prevStart.toISOString(), endISO: start.toISOString() },
        bucketStrategy: 'monthly',
        timeLabel: `${formatMonthYearTR(start)} – ${formatMonthYearTR(now)}`,
      };
    }

    case 'lastYear': {
      const year = now.getUTCFullYear() - 1;
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1)); // Jan 1 of this year
      const prevStart = new Date(Date.UTC(year - 1, 0, 1));
      return {
        key,
        label: 'Geçen Yıl',
        range: { startISO: start.toISOString(), endISO: end.toISOString() },
        previousRange: { startISO: prevStart.toISOString(), endISO: start.toISOString() },
        bucketStrategy: 'monthly',
        timeLabel: `${formatMonthYearTR(start)} – Ara ${year}`,
      };
    }

    case 'allTime': {
      // Start from a far-back date (2020-01-01) to capture everything
      const start = new Date(Date.UTC(2020, 0, 1));
      // Previous range: not meaningful for "all time", use same span before start
      const spanMs = now.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - spanMs);
      return {
        key,
        label: 'Tüm Zamanlar',
        range: { startISO: start.toISOString(), endISO: nowISO },
        previousRange: { startISO: prevStart.toISOString(), endISO: start.toISOString() },
        bucketStrategy: 'monthly',
        timeLabel: `${formatMonthYearTR(start)} – ${formatMonthYearTR(now)}`,
      };
    }
  }
}

// ─── getDateRangeConfig6m (fixed last 6 months) ─────────
export function getDateRangeConfig6m(): Omit<DateRangeConfig, 'key' | 'label' | 'previousRange'> {
  const now = new Date();
  const nowISO = now.toISOString();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  return {
    range: { startISO: start.toISOString(), endISO: nowISO },
    bucketStrategy: 'monthly',
    timeLabel: 'Son 6 Ay',
  };
}

// ─── generateBuckets ──────────────────────────────────────
export type Buckets = { bucketStarts: Date[]; labels: string[] };

export function generateBuckets(range: DateRange, strategy: BucketStrategy): Buckets {
  const start = new Date(range.startISO);
  const end = new Date(range.endISO);

  switch (strategy) {
    case 'hourly': {
      const bucketStarts: Date[] = [];
      const labels: string[] = [];
      for (let h = 0; h < 24; h++) {
        bucketStarts.push(new Date(Date.UTC(
          start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), h,
        )));
        labels.push(`${String(h).padStart(2, '0')}:00`);
      }
      return { bucketStarts, labels };
    }

    case 'daily': {
      const bucketStarts: Date[] = [];
      const labels: string[] = [];
      const cursor = new Date(start);
      while (cursor < end) {
        bucketStarts.push(new Date(cursor));
        // Use day number for thisMonth, day name for thisWeek
        const dayOfWeek = cursor.getUTCDay();
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        // If range spans <= 7 days, use day names; otherwise use day numbers
        const spanDays = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
        if (spanDays <= 7) {
          labels.push(DAY_SHORT_TR[dayIndex]);
        } else {
          labels.push(String(cursor.getUTCDate()));
        }
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      return { bucketStarts, labels };
    }

    case 'monthly': {
      const bucketStarts: Date[] = [];
      const labels: string[] = [];
      const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
      const endMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
      // If span > 12 months, include short year to disambiguate
      const spanMonths =
        (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
        (end.getUTCMonth() - start.getUTCMonth());
      const showYear = spanMonths > 12;
      while (cursor <= endMonth) {
        bucketStarts.push(new Date(cursor));
        const monthLabel = MONTH_SHORT_TR[cursor.getUTCMonth()];
        labels.push(showYear ? `${monthLabel} '${String(cursor.getUTCFullYear()).slice(2)}` : monthLabel);
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
      return { bucketStarts, labels };
    }
  }
}

// ─── assignToBucket ───────────────────────────────────────
/**
 * Given a created_at ISO string and bucket boundaries, return the bucket index.
 * Returns -1 if the date is outside all buckets.
 */
export function assignToBucket(
  createdAt: string,
  bucketStarts: Date[],
  _strategy: BucketStrategy,
): number {
  const dt = new Date(createdAt).getTime();
  // Find the last bucket whose start <= dt
  for (let i = bucketStarts.length - 1; i >= 0; i--) {
    if (dt >= bucketStarts[i].getTime()) return i;
  }
  return -1;
}

// ─── buildSeriesFromBuckets ───────────────────────────────
/**
 * Generic: distribute rows into buckets and return labels + data.
 */
export function buildSeriesFromBuckets(
  rows: { created_at: string }[],
  buckets: Buckets,
  strategy: BucketStrategy,
): { labels: string[]; data: number[] } {
  const counts = new Array(buckets.labels.length).fill(0) as number[];
  for (const r of rows) {
    const idx = assignToBucket(r.created_at, buckets.bucketStarts, strategy);
    if (idx >= 0) counts[idx]++;
  }
  return { labels: buckets.labels, data: counts };
}
