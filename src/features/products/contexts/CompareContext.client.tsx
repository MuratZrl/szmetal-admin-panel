'use client';
// src/features/products/contexts/CompareContext.client.tsx

import * as React from 'react';

const MAX_COMPARE = 4;

export type CompareItem = {
  id: string;
  label: string;
};

type CompareContextValue = {
  items: CompareItem[];
  toggle: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  count: number;
  canCompare: boolean;
  isFull: boolean;
};

const CompareContext = React.createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CompareItem[]>([]);

  const toggle = React.useCallback((item: CompareItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = React.useCallback(() => {
    setItems([]);
  }, []);

  const isSelected = React.useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  );

  const count = items.length;
  const canCompare = count >= 2;
  const isFull = count >= MAX_COMPARE;

  const value = React.useMemo<CompareContextValue>(
    () => ({ items, toggle, remove, clear, isSelected, count, canCompare, isFull }),
    [items, toggle, remove, clear, isSelected, count, canCompare, isFull],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = React.useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
