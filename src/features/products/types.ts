// src/features/products/types.ts

// Filtre parametreleri
export type ProductFilters = {
  q?: string;                   // code veya ad arama
  categories?: string[];        // çoklu
  subCategories?: string[];     // çoklu
  variants?: string[];          // çoklu
  wMin?: number;
  wMax?: number;
  from?: string;                // yyyy-mm-dd
  to?: string;                  // yyyy-mm-dd
  sort?: 
    | 'date-desc' 
    | 'date-asc' 
    | 'weight-asc' 
    | 'weight-desc' 
    | 'code-asc' 
    | 'code-desc';
};
