// src/features/products/forms/schema.ts
import * as yup from 'yup';

/** --- Customer Mold tipleri --- */
export type CustomerMoldValue = 'Evet' | 'Hayır';
export type CustomerMoldSelect = '' | CustomerMoldValue;

/** Genel: zorunlu select’ler için '' → undefined; required yakalasın */
const requiredSelect = yup
  .string()
  .transform((_v, orig) => (orig === '' ? undefined : _v))
  .required('Zorunlu');

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

/** Opsiyonel ISO tarih (yyyy-mm-dd) — boş string serbest */
const optionalIsoDateString = () =>
  yup
    .string()
    .test('iso-or-empty', 'Geçersiz tarih', (v) => {
      if (!v) return true; // '' veya undefined → serbest
      if (typeof v !== 'string') return false;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      const d = new Date(v);
      return !Number.isNaN(d.getTime());
    })
    .default('')
    .defined();

/** ---- ÜRÜN FORM ŞEMASI ----
 * Zorunlu alanlar: name, code, variant, category, subCategory,
 * availability, unitWeightG, date
 * Not: customerMold üç durumlu tutulur ('' | 'Evet' | 'Hayır'),
 *      zorlamayı UI’da yapabilir ya da submit’te kontrol edebilirsin.
 */
export const productSchema = yup
  .object({
    // Zorunlu metinler
    name: yup.string().required('Zorunlu'),
    code: yup.string().required('Zorunlu'),

    // Zorunlu selectler
    variant: requiredSelect,
    category: requiredSelect,
    subCategory: requiredSelect,

    // Üç durumlu: '' | 'Evet' | 'Hayır' (boş seçime izin veriyoruz)
    customerMold: yup
      .mixed<CustomerMoldSelect>()
      .oneOf(['', 'Evet', 'Hayır'] as const)
      .defined(),

    // Zorunlu: availability (true/false olmalı)
    availability: yup.boolean().required('Zorunlu').default(true),

    // Opsiyonel açıklama metni
    description: yup.string().default('').defined(),

    // gr/m — integer normalize, min 1 ve zorunlu
    unitWeightG: toNullNumber()
      .transform((v) => (typeof v === 'number' ? Math.round(v) : v))
      .required('Zorunlu')
      .min(1, 'En az 1 gr'),

    // Ana tarih (Zorunlu).
    date: yup.string().required('Zorunlu'),

    // Revizyon tarihi (opsiyonel)
    revisionDate: optionalIsoDateString(),

    // Düz string alanlar (boş string serbest)
    drawer: yup.string().default('').defined(),
    control: yup.string().default('').defined(),
    scale: yup.string().default('').defined(),

    // Opsiyonel sayısal alanlar
    outerSizeMm: toNullNumber(),
    sectionMm2: toNullNumber(),

    // Opsiyonel metinler
    tempCode: emptyToNull(),
    manufacturerCode: emptyToNull(),

    // URL **veya** storage path kabul et
    image: yup
      .string()
      .trim()
      // boş | http(s) URL | storage path (images/... veya pdf/..., products/...)
      .test('url-or-path', 'Geçersiz URL', (v) => {
        if (!v) return true;
        if (/^https?:\/\//i.test(v)) return true;
        return /^[a-z0-9/_.-]+$/i.test(v);
      })
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

  variant: '',       // requiredSelect: '' → undefined sayılır, validasyonda yakalanır
  category: '',
  subCategory: '',

  // UI’da placeholder göstermek istiyorsan '' bırak.
  // “Default Hayır olsun” dersen 'Hayır' yap.
  customerMold: '',

  availability: true,

  description: '',

  unitWeightG: 0, // gr/m (min 1 validasyonda yakalanır)
  date: today(),

  revisionDate: '',

  drawer: '',
  control: '',
  scale: '',

  outerSizeMm: null,
  sectionMm2: null,

  tempCode: null,
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

/** Select → boolean yardımcı (create/update payload’larında işe yarar) */
export function customerMoldToBoolean(
  v: CustomerMoldSelect
): boolean | undefined {
  if (v === '') return undefined;
  return v === 'Evet';
}
