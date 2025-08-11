// app/lib/stores/categoryStore.ts
'use client';

import { create } from 'zustand';

type CategoryStore = {
  selectedCategoryId: string | null;
  selectedSubCategoryIds: string[]; // ✅ artık dizi
  selectedProperties: string[]; // ✅ property filtresi için eklendi
  setSelectedCategoryId: (id: string) => void;
  setSelectedSubCategoryIds: (ids: string[]) => void; // ✅ artık dizi parametre
  setSelectedProperties: (props: string[]) => void; // ✅ property setter eklendi
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategoryId: null,
  selectedSubCategoryIds: [], // ✅ boş dizi
  selectedProperties: [], // ✅ başlangıç boş
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedSubCategoryIds: (ids) => set({ selectedSubCategoryIds: ids }), // ✅ çoğul
  setSelectedProperties: (props) => set({ selectedProperties: props }), // ✅ setter
}));
