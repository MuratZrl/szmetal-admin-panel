// app/lib/stores/categoryStore.ts
'use client';

import { create } from 'zustand';

type CategoryStore = {
  selectedCategoryId: string | null;
  selectedSubCategoryIds: string[]; // ✅ artık dizi
  selectedProperties: string[]; // ✅ property filtresi için eklendi
  searchTerm: string; // ✅ Arama için eklendi
  setSelectedCategoryId: (id: string) => void;
  setSelectedSubCategoryIds: (ids: string[]) => void; // ✅ artık dizi parametre
  setSelectedProperties: (props: string[]) => void; // ✅ property setter eklendi
  setSearchTerm: (term: string) => void; // ✅ Arama setter
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategoryId: null,
  selectedSubCategoryIds: [], // ✅ boş dizi
  selectedProperties: [], // ✅ başlangıç boş
  searchTerm: '', // ✅ Başlangıç boş
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedSubCategoryIds: (ids) => set({ selectedSubCategoryIds: ids }), // ✅ çoğul
  setSelectedProperties: (props) => set({ selectedProperties: props }), // ✅ setter
  setSearchTerm: (term) => set({ searchTerm: term }), // ✅ Setter
}));
