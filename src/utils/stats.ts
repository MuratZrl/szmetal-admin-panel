// src/utils/stats.ts (güncelle)
export type ChangeResult = { percent: number; trend?: 'up' | 'down' };

export function calcChangeAndTrend(previous: number, current: number): ChangeResult {
  if (previous === 0) {
    if (current === 0) return { percent: 0, trend: undefined };
    return { percent: 100, trend: 'up' };
  }
  const raw = ((current - previous) / previous) * 100;
  const percent = Math.round(Math.abs(raw));
  const trend = current > previous ? 'up' : current < previous ? 'down' : undefined;
  return { percent, trend };
}
