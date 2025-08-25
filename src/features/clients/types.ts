// src/types/clients.ts
export type Trend = 'up' | 'down' | undefined;

export interface ClientTotals {
  totalUsers: number;
  activeUsers: number;
  passiveUsers: number;
  bannedUsers: number;

  thisMonthTotal: number;
  lastMonthTotal: number;

  totalChange: number;   // yüzde (0..100..)
  totalTrend?: Trend;

  activeChange: number;
  activeTrend?: Trend;

  passiveChange: number;
  passiveTrend?: Trend;

  bannedChange: number;
  bannedTrend?: Trend;

  // opsiyonel: grafik verileri veya başka meta
  monthlySeries?: unknown;   // istersen burayı daha spesifik bir tiple değiştir
  groupedSeries?: unknown;
}
