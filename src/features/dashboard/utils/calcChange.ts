// src/features/dashboard/utils/calcChange.ts
export type Trend = "up" | "down" | undefined;

export function calcChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function getTrend(current: number, previous: number): Trend {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return undefined;
}
