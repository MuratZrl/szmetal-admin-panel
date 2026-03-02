// src/features/dashboard/types/dashboardData.ts

import type { CardsData } from '../services/card.server';
import type { CategoryPieData } from '../services/categoryChart.server';
export type { CategoryPieData };

// ─── Date Range ───────────────────────────────────────────
export type DateRangeKey = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'lastYear' | 'allTime';

export type DateRange = {
  startISO: string; // inclusive
  endISO: string;   // exclusive (now)
};

export type BucketStrategy = 'hourly' | 'daily' | 'monthly';

export type DateRangeConfig = {
  key: DateRangeKey;
  label: string;          // Turkish label for tabs
  range: DateRange;
  previousRange: DateRange;
  bucketStrategy: BucketStrategy;
  timeLabel: string;      // e.g. "1 Şub – 17 Şub" for chart card headers
};

// ─── Series / Chart Data ──────────────────────────────────
export type SeriesData = { labels: string[]; data: number[] };

export type GroupBarSeriesItem = { key: string; label: string; data: number[] };
export type GroupBarData = { labels: string[]; series: GroupBarSeriesItem[] };

// ─── Unified Dashboard Payload ────────────────────────────
export type DashboardPayload = {
  cards: CardsData;
  usersSeries: SeriesData;
  productsSeries: SeriesData;
  categoryPie: CategoryPieData;
  customerMoldRate: number;
  customerMoldCount: number;
  timeLabel: string;
  /** Fixed 6-month series for "Yeni Kullanıcılar" chart */
  usersSeries6m: SeriesData;
  /** Fixed 6-month series for "Yeni Ürünler" chart */
  productsSeries6m: SeriesData;
  /** Time label for the fixed 6-month charts (e.g. "Son 6 Ay") */
  timeLabel6m: string;
  /** Fixed all-time data for "Kategori Dağılımı" */
  categoryPieAllTime: CategoryPieData;
};
