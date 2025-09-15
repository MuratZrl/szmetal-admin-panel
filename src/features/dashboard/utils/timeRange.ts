// src/utils/charts/timeRange.ts
export function labelRange(labels: string[]): string {
  if (!Array.isArray(labels) || labels.length === 0) return '—';
  const first = (labels[0] ?? '').trim();
  const last = (labels[labels.length - 1] ?? '').trim();
  if (!first && !last) return '—';
  return first === last ? first : `${first} – ${last}`;
}
