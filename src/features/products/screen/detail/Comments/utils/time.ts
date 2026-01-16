// src/features/products/screen/detail/Comments/utils/time.ts

/**
 * ISO tarihini "… önce / … sonra" formatında verir (tr-TR).
 * Intl.RelativeTimeFormat kullanır.
 */
export function relativeTime(iso: string): string {
  const dt = new Date(iso).getTime();
  const now = Date.now();

  if (!Number.isFinite(dt)) return iso;

  // Negatif değer geçmişi temsil eder; Intl.RelativeTimeFormat buna göre "… önce" üretir.
  const diffSeconds = Math.round((dt - now) / 1000);
  const abs = Math.abs(diffSeconds);

  const rtf = new Intl.RelativeTimeFormat('tr-TR', { numeric: 'auto' });

  if (abs < 60) return rtf.format(diffSeconds, 'second');

  const mins = Math.trunc(diffSeconds / 60);
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');

  const hours = Math.trunc(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');

  const days = Math.trunc(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(days, 'day');

  const weeks = Math.trunc(days / 7);
  if (Math.abs(weeks) < 5) return rtf.format(weeks, 'week');

  const months = Math.trunc(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');

  const years = Math.trunc(days / 365);
  return rtf.format(years, 'year');
}

/**
 * Tooltip için tam tarih formatı (tr-TR).
 */
export function formatFullDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return iso;

    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return iso;
  }
}
