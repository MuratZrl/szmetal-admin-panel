// src/features/notifications/utils/timeAgo.ts

/**
 * Türkçe göreceli zaman formatlayıcı.
 * "az önce", "5 dk önce", "2 saat önce", "3 gün önce" vb.
 */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  if (weeks < 5) return `${weeks} hafta önce`;
  if (months < 12) return `${months} ay önce`;

  // 1 yıldan eski — tarih göster
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
