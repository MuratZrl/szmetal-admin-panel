// src/features/dashboard/types.ts
import type { Trend } from "./utils/calcChange";

export type DashboardTotals = {
  totalUsers: number;
  totalRequests: number;      // pending
  uniqueSystems: number;      // unique slug count
};

export type DashboardTrends = {
  user: { change: number; trend: Trend };
  request: { change: number; trend: Trend };
  system: { change: number; trend: Trend };
};

export type DashboardData = {
  totals: DashboardTotals;
  trends: DashboardTrends;
};
