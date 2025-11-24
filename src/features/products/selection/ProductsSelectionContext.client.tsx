// src/features/products/selection/ProductsSelectionContext.client.tsx
'use client';

import * as React from 'react';

type ProductId = string;

type ProductsSelectionContextValue = {
  selected: Set<ProductId>;
  isSelected: (id: ProductId) => boolean;
  toggle: (id: ProductId) => void;
  clear: () => void;
  count: number;
};

const ProductsSelectionContext = React.createContext<ProductsSelectionContextValue | null>(null);

type ProviderProps = {
  children: React.ReactNode;
};

export function ProductsSelectionProvider({ children }: ProviderProps): React.JSX.Element {
  const [selected, setSelected] = React.useState<Set<ProductId>>(new Set());

  const toggle = React.useCallback((id: ProductId): void => {
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

  const clear = React.useCallback((): void => {
    setSelected(new Set());
  }, []);

  const isSelected = React.useCallback(
    (id: ProductId): boolean => selected.has(id),
    [selected],
  );

  const value = React.useMemo<ProductsSelectionContextValue>(
    () => ({
      selected,
      isSelected,
      toggle,
      clear,
      count: selected.size,
    }),
    [selected, isSelected, toggle, clear],
  );

  return (
    <ProductsSelectionContext.Provider value={value}>
      {children}
    </ProductsSelectionContext.Provider>
  );
}

export function useProductsSelection(): ProductsSelectionContextValue {
  const v = React.useContext(ProductsSelectionContext);
  if (!v) {
    throw new Error('useProductsSelection must be used within ProductsSelectionProvider');
  }
  return v;
}
