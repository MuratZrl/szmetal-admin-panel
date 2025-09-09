import type { ProductFormValues } from './schema';

const today = (): string => new Date().toISOString().slice(0, 10);

/** Create formu için varsayılan değerler */
export const newProductDefaults: ProductFormValues = {
  name: '',
  code: '',

  variant: '',
  category: '',
  subCategory: '',

  unitWeightG: 0,                 // gr/m
  date: today(),

  drawer: '',
  control: '',
  scale: '',

  outerSizeMm: null,
  sectionMm2: null,

  tempCode: null,
  profileCode: null,
  manufacturerCode: null,

  image: '',                         // public URL; boş olabilir
};

/** Opsiyonel override ile yeni default üret (date hariç ezme) */
export function makeNewProductDefaults(
  override?: Partial<ProductFormValues>
): ProductFormValues {
  return {
    ...newProductDefaults,
    ...override,
    date: override?.date ?? today(),
  };
}

/** Form bileşenlerinde lazım olursa: file alanını eklemek için tip */
export type ProductFormValuesWithFile = ProductFormValues & { file: File | null };
