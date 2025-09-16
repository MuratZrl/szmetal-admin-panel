// src/features/products/forms/schema.ts
import * as yup from 'yup';

/** --- Customer Mold tipleri --- */
export type CustomerMoldValue = 'Evet' | 'Hayır';
export type CustomerMoldSelect = '' | CustomerMoldValue;

/** Select alanlarında '' → undefined; boş seçim yakalansın */
const requiredSelect = yup
  .string()
  .transform((_v, orig) => (orig === '' ? undefined : _v))
  .required('Zorunlu');

/** Customer Mold: çekirdek alan (üvey değil) */
const customerMoldSelect = yup
  .mixed<CustomerMoldSelect>()
  .oneOf(['', 'Evet', 'Hayır'] as const)
  .default('Hayır')
  .defined();

/** Sayısal alanlar: '' ve NaN → null, min 0 */
const toNullNumber = () =>
  yup
    .number()
    .transform((val, orig) => (orig === '' || Number.isNaN(val) ? null : val))
    .nullable()
    .min(0, '0 veya daha büyük olmalı');

/** Opsiyonel metin: '' → null */
const emptyToNull = () =>
  yup
    .string()
    .optional()
    .nullable()
    .transform((v, orig) => (orig === '' ? null : v?.trim() ?? null));

/** ---- ÇEKİRDEK ÜRÜN FORM ŞEMASI ---- */
export const productSchema = yup
  .object({
    // Zorunlu metinler
    name: yup.string().required('Zorunlu'),
    code: yup.string().required('Zorunlu'),

    // Zorunlu selectler
    variant: requiredSelect,
    category: requiredSelect,
    subCategory: requiredSelect,

    // Çekirdek: Customer Mold
    customerMold: customerMoldSelect,

    // gr/m — integer normalize, min 1 ve zorunlu
    unitWeightG: toNullNumber()
      .transform(v => (typeof v === 'number' ? Math.round(v) : v))
      .required('Zorunlu')
      .min(1, 'En az 1 gr'),

    // Tarih
    date: yup.string().required('Zorunlu'),

    // Düz string alanlar (boş string serbest)
    drawer: yup.string().default('').defined(),
    control: yup.string().default('').defined(),
    scale: yup.string().default('').defined(),

    // Opsiyonel sayısal alanlar
    outerSizeMm: toNullNumber(),
    sectionMm2: toNullNumber(),

    // Opsiyonel metinler
    profileCode: emptyToNull(),
    tempCode: emptyToNull(),
    manufacturerCode: emptyToNull(),

    // Asset public URL: boş olabilir ya da geçerli URL olmalı
    image: yup
      .string()
      .trim()
      .test('url-or-empty', 'Geçersiz URL', v => !v || /^https?:\/\/.+/i.test(v))
      .default('')
      .defined(),
  })
  .required();

export type ProductFormValues = yup.InferType<typeof productSchema>;

/** ---- Varsayılan değerler ---- */
const today = (): string => new Date().toISOString().slice(0, 10);

export const newProductDefaults: ProductFormValues = {
  name: '',
  code: '',

  variant: '',
  category: '',
  subCategory: '',

  // Çekirdek: Customer Mold default
  customerMold: 'Hayır',

  unitWeightG: 0, // gr/m (min 1 validasyonda yakalanır)
  date: today(),

  drawer: '',
  control: '',
  scale: '',

  outerSizeMm: null,
  sectionMm2: null,

  tempCode: null,
  profileCode: null,
  manufacturerCode: null,

  image: '',
};

/** İsteğe bağlı override ile yeni default üret (date’i bugüne sabitler) */
export function makeNewProductDefaults(
  override?: Partial<ProductFormValues>
): ProductFormValues {
  return {
    ...newProductDefaults,
    ...override,
    date: override?.date ?? today(),
  };
}

/** Select → boolean yardımcı (create/update payload’larında işine yarar) */
export function customerMoldToBoolean(
  v: CustomerMoldSelect
): boolean | undefined {
  if (v === '') return undefined;
  return v === 'Evet';
}
