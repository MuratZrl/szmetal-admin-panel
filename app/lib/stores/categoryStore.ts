// app/lib/stores/categoryStore.ts
'use client';

import { create } from 'zustand';

type CategoryStore = {
  selectedCategoryId: string | null;
  selectedSubCategoryIds: string[]; // ✅ artık dizi
  selectedProperties: string[]; // ✅ property filtresi için eklendi
  searchTerm: string; // ✅ Arama için eklendi
  kgPerMRange: [number, number]; // ✅ min-max aralığı
  setSelectedCategoryId: (id: string) => void;
  setSelectedSubCategoryIds: (ids: string[]) => void; // ✅ artık dizi parametre
  setSelectedProperties: (props: string[]) => void; // ✅ property setter eklendi
  setSearchTerm: (term: string) => void; // ✅ Arama setter
  setKgPerMRange: (range: [number, number]) => void; // ✅ setter
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategoryId: null,
  selectedSubCategoryIds: [], // ✅ boş dizi
  selectedProperties: [], // ✅ başlangıç boş
  searchTerm: '', // ✅ Başlangıç boş
  kgPerMRange: [0, 25000], // başlangıç aralığı
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedSubCategoryIds: (ids) => set({ selectedSubCategoryIds: ids }), // ✅ çoğul
  setSelectedProperties: (props) => set({ selectedProperties: props }), // ✅ setter
  setSearchTerm: (term) => set({ searchTerm: term }), // ✅ Setter
  setKgPerMRange: (range) => set({ kgPerMRange: range }),
}));
