// src/features/products/schema/productFormSchema.ts
import * as yup from 'yup';

export type CategoryTree = Record<string, string[]>;

const toNullNumber = () =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || Number.isNaN(v) ? null : v))
    .nullable()
    .min(0, '0 veya daha büyük olmalı');

const urlOrEmpty = () =>
  yup
    .string()
    .trim()
    .test('url-or-empty', 'Geçersiz URL', v => !v || /^https?:\/\/.+/i.test(v ?? ''))
    .default('')
    .defined();

export type MakeProductCreateSchemaArgs = {
  variants: string[];
  categoryTree: CategoryTree;
  maxUnitWeightKg?: number;
};

// Form CREATE şeması (Edit için gerekiyorsa ikinci bir factory yazarsın)
export const makeProductCreateSchema = (args: MakeProductCreateSchemaArgs) =>
  yup.object({
    displayName: yup.string().required('Zorunlu'),
    name: yup.string().required('Zorunlu'),
    code: yup.string().required('Zorunlu'),

    variant: yup.string().oneOf(args.variants, 'Geçersiz varyant').required('Zorunlu'),
    category: yup
      .string()
      .oneOf(Object.keys(args.categoryTree), 'Geçersiz kategori')
      .required('Zorunlu'),
    subCategory: yup
      .string()
      .test('sub-in-cat', 'Geçersiz alt kategori', function (value) {
        const cat = this.parent.category as string | undefined;
        if (!cat || !value) return false;
        const subs = args.categoryTree[cat] ?? [];
        return subs.includes(value);
      })
      .required('Zorunlu'),

    unitWeightKg: toNullNumber(),
    date: yup.string().required('Zorunlu'),

    drawer: yup.string().default('').defined(),
    control: yup.string().default('').defined(),
    scale: yup.string().default('').defined(),

    outerSizeMm: toNullNumber(),
    sectionMm2: toNullNumber(),
    unitWeightGrPerM: toNullNumber(),

    tempCode: yup.string().default('').defined(),
    profileCode: yup.string().default('').defined(),
    manufacturerCode: yup.string().default('').defined(),

    image: urlOrEmpty(),
  });

export type ProductCreateValues = yup.InferType<ReturnType<typeof makeProductCreateSchema>>;
