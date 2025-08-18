// src/types/dashboard.ts
export type Trend = 'up' | 'down' | undefined;

export interface DashboardTotals {
  totalUsers: number;
  totalRequests: number;
  uniqueSystems: number;

  userChangePercent: number;
  userTrend?: Trend;

  requestChangePercent: number;
  requestTrend?: Trend;

  systemChangePercent: number;
  systemTrend?: Trend;
}

export type ChartPoint = { x: string; y: number }; // simple; charts beklentine göre genişlet
export interface ChartSeries {
  name: string;
  data: ChartPoint[];
}

export interface DashboardData {
  totals: DashboardTotals;
  monthlyUsersSeries: ChartSeries[];    // örn: [{ name: 'Users', data: [...] }]
  roleSeries?: ChartSeries[];           // rol bazlı çubuklar
  // gerektiği kadar genişlet
}
