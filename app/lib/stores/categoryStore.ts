// app/lib/stores/categoryStore.ts
'use client';

import { create } from 'zustand';

type CategoryStore = {
  selectedCategoryId: string | null;
  selectedSubCategoryId: string | null;
  setSelectedCategoryId: (id: string) => void;
  setSelectedSubCategoryId: (id: string) => void;
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategoryId: null,
  selectedSubCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedSubCategoryId: (id) => set({ selectedSubCategoryId: id }),
}));