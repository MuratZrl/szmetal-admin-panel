'use client';

import { create } from 'zustand';

type CategoryStore = {
  selectedCategoryId: string | null;
  selectedSubCategoryIds: string[]; // ✅ artık dizi
  setSelectedCategoryId: (id: string) => void;
  setSelectedSubCategoryIds: (ids: string[]) => void; // ✅ artık dizi parametre
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategoryId: null,
  selectedSubCategoryIds: [], // ✅ boş dizi
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedSubCategoryIds: (ids) => set({ selectedSubCategoryIds: ids }), // ✅ çoğul
}));
