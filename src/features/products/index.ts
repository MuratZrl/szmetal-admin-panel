// Ortak, tarafsız ihracatlar (server/client karışmasın)
export type { ProductDicts } from './services/dicts.server';

// Form şeması ve tipleri
export { productSchema, type ProductFormValues } from './forms/schema';
export { newProductDefaults, makeNewProductDefaults, type ProductFormValuesWithFile } from './forms/defaultValues';

// Mapper tip ve yardımcıları (mapRowToForm isomorphic, ama server'da kullanmak daha mantıklı)
export {
  trimToNull,
  toInsertPayload,
  toUpdatePayload,
  mapRowToForm,
  type ProductFormValuesCore,
  type ProductFormValuesWithRelations,
  type FileMeta,
  type ProductUpdateInput,
} from './forms/mappers';
