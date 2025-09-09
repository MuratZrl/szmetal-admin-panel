// Sadece client tarafta import et!
export { default as ProductEditForm } from './components/ProductEditForm.client';

// Client hook'lar (varsa)
export { useProducts, useProduct } from './hooks/useProductQuery.client';
export { useProductUpdate } from './hooks/useProductUpdate.client';

// UI parçaları (client)
export { default as NumberField, NumberFieldStandalone } from './components/form/NumberField';
export { default as FormSection } from './components/form/FormSection';
