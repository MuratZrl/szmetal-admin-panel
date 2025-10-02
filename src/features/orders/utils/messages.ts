// src/features/orders/utils/messages.ts
export type RequestStatus = 'pending' | 'approved' | 'rejected';

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function ensureSuffixOnce(base: string, suffix: string): string {
  const b = normalizeSpaces(base);
  const s = normalizeSpaces(suffix);
  // base zaten "… suffix" ile bitiyorsa tekrar ekleme
  if (b.toLowerCase().endsWith(` ${s.toLowerCase()}`)) return b;
  return `${b} ${s}`;
}

export function buildOrderMessage(title: string, status: RequestStatus): { message: string; type: 'success'|'error'|'info' } {
  const cleanTitle = normalizeSpaces(title);

  // “talebi” sadece bir kez eklenecek
  const subject = ensureSuffixOnce(cleanTitle, 'talebi');

  if (status === 'approved') {
    return { message: `${subject} başarıyla onaylandı.`, type: 'success' };
  }
  if (status === 'rejected') {
    return { message: `${subject} reddedildi.`, type: 'error' };
  }
  return { message: `${subject} inceleniyor.`, type: 'info' };
}
