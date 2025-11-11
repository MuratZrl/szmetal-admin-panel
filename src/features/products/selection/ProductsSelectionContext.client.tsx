// src/features/products/selection/ProductsSelectionContext.client.tsx
'use client';
import * as React from 'react';

type Ctx = {
  selected: Set<number>;
  isSelected: (id: number) => boolean;
  toggle: (id: number) => void;
  clear: () => void;
  count: number;
};

const Ctx = React.createContext<Ctx | null>(null);

export function ProductsSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  const toggle = React.useCallback((id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clear = React.useCallback(() => setSelected(new Set()), []);

  const isSelected = React.useCallback((id: number) => selected.has(id), [selected]);

  const value = React.useMemo<Ctx>(() => ({
    selected, isSelected, toggle, clear, count: selected.size,
  }), [selected, toggle, clear, isSelected]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProductsSelection() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useProductsSelection must be used within ProductsSelectionProvider');
  return v;
}
