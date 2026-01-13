// src/features/products/components/ProductInfo/formatters.ts
import type * as React from 'react';

const fmtInt = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: false, // 1202 gibi, 1.202 değil
});

export function formatInt(n?: number | null): string | undefined {
  return typeof n === 'number' ? fmtInt.format(n) : undefined;
}

export function safeNode(v: React.ReactNode): React.ReactNode {
  return v === undefined || v === null || v === '' ? '—' : v;
}

export function safeText(v?: string | null): string {
  return typeof v === 'string' && v ? v : '—';
}

/** created_at genelde ISO datetime, sadece tarihi göstermek için ilk 10 karakter */
export function toDateOnly(iso?: string | null): string {
  return typeof iso === 'string' && iso ? iso.slice(0, 10) : '';
}

/** Link/filename için basit slug, Türkçe karakterleri olduğu gibi bırakır ama güvenli yapar */
export function toSafeFilenameBase(input: string): string {
  return input.replace(/\s+/g, '-').replace(/[^\w.-]/g, '');
}
