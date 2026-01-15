// src/features/products/components/ProductInfo/rows.ts
import type * as React from 'react';
import type { LabelMaps } from './types';

export type DetailItem = { label: string; value: React.ReactNode };

function hasMeaningfulValue(v: React.ReactNode): boolean {
  if (v === null || v === undefined) return false;

  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return false;
    if (t === '—' || t === '--') return false;
    return true;
  }

  return true;
}

export function buildProductInfoRows(input: {
  variant: string;
  category?: string | null;
  subCategory?: string | null;
  subSubCategory?: string | null;

  unitWeight: string | React.ReactNode;
  scale?: React.ReactNode; // ✅ SADECE TİP

  date: string;
  revisionDate?: string | null;

  drawer?: React.ReactNode;
  control?: React.ReactNode;
  moldChip?: React.ReactNode;
  usageNode?: React.ReactNode;

  tail: Array<DetailItem>;
  labels?: LabelMaps;
}): Array<[DetailItem, DetailItem | null]> {
  const { labels } = input;

  const variantText = labels?.variant?.[input.variant] ?? input.variant;
  const catText = input.category ? (labels?.category?.[input.category] ?? input.category) : '';
  const subText = input.subCategory ? (labels?.subCategory?.[input.subCategory] ?? input.subCategory) : '';
  const leafText = input.subSubCategory
    ? (labels?.subSubCategory?.[input.subSubCategory] ?? input.subSubCategory)
    : '';

  const safe = (v: React.ReactNode) => (hasMeaningfulValue(v) ? v : '—');
  const make = (label: string, value: React.ReactNode): DetailItem => ({ label, value });

  const rows: Array<[DetailItem, DetailItem | null]> = [];

  rows.push([
    make('Kategori', safe(catText)), 
    make('Alt Kategori', safe(subText))
  ]);
  
  rows.push([
    make('Varyant', safe(variantText)), 
    make('En Alt Kategori', safe(leafText))
  ]);
  
  rows.push([
    make('Kullanım Durumu', safe(input.usageNode)), 
    make('Müşteri Kalıbı', safe(input.moldChip))
  ]);

  // ✅ İSTEDİĞİN Birim Ağırlık + Ölçek aynı satır
  rows.push([
    make('Birim Ağırlık (gr/m)', safe(input.unitWeight)),
    make('Ölçek', safe(input.scale)),
  ]);

  // ✅ İSTEDİĞİN Çizim Tarihi + Revizyon Tarihi her zaman aynı satır
  rows.push([
    make('Çizildiği Tarih', safe(input.date)),
    make('Revizyon Tarihi', safe(input.revisionDate)),
  ]);

  // ✅ Tail’de value boş/placeholder ise tabloya hiç sokma
  const filteredTail = input.tail.filter((it) => hasMeaningfulValue(it.value));
  for (let i = 0; i < filteredTail.length; i += 2) {
    rows.push([filteredTail[i]!, filteredTail[i + 1] ?? null]);
  }

  return rows;
}
