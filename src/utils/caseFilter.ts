// src/utils/caseFilter.ts
export function humanizeSystemSlug(input?: string | null, locale: string = 'tr-TR'): string {
  if (!input) return '---';
  const normalized = String(input).trim().replace(/[_\s]+/g, '-');
  const ACRONYMS = new Set(['api','sku','id','ui','ux','ip','pdf','csv','xml','gps','erp','crm']);
  const parts = normalized.split('-').filter(Boolean);
  const words = parts.map((part) => {
    const lower = part.toLocaleLowerCase(locale);
    if (ACRONYMS.has(lower)) return lower.toUpperCase();
    const first = lower.charAt(0).toLocaleUpperCase(locale);
    return first + lower.slice(1);
  });
  return words.join(' ');
}

/** Değer slug gibi mi? (kebab/underscore veya tamamen lower-case) */
export function isSlugLike(input?: string | null): boolean {
  if (!input) return false;
  const s = String(input);
  return /[-_]/.test(s) || s === s.toLowerCase();
}
