// Sadece server tarafta import et!
export { fetchProductById } from './services/products.server';
export { fetchProductDicts } from './services/dicts.server';

// İsteğe bağlı: server tarafta pratik olsun diye mapRowToForm'u da buradan ver
export { mapRowToForm } from './forms/mappers';
