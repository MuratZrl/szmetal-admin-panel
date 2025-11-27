// src/features/products/forms/schema.ts
import * as yup from 'yup';

/** --- Customer Mold tipleri --- */
export type CustomerMoldValue = 'Evet' | 'Hayır';
export type CustomerMoldSelect = '' | CustomerMoldValue;

/** "Varyant" için tek kaynak: UI'da "Yok" */
export const DEFAULT_VARIANT_KEY = 'yok' as const;

/** Sayısal alanlar: '' ve NaN → null */
const toNullNumber = () =>
  yup
    .number()
    .transform((val, orig) => (orig === '' || Number.isNaN(val) ? null : val))
    .nullable();

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
      if (!v) return true;
      if (typeof v !== 'string') return false;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      const d = new Date(v);
      return !Number.isNaN(d.getTime());
    })
    .default('')
    .defined();

/** ---- ÜRÜN FORM ŞEMASI ----
 * Zorunlu alanlar: name, code, category, subCategory, availability, unitWeightKg, date
 * Varyant: boş bırakılırsa otomatik olarak "yok" kabul edilir ve geçerlidir.
 */
export const productSchema = yup
  .object({
    // Zorunlu metinler
    name: yup.string().required('Zorunlu'),
    code: yup.string().required('Zorunlu'),

    // Varyant: '' veya undefined gelirse DEFAULT_VARIANT_KEY
    variant: yup
      .string()
      .transform((_v, orig) =>
        orig === '' || orig == null ? DEFAULT_VARIANT_KEY : _v,
      )
      .default(DEFAULT_VARIANT_KEY)
      .defined(),

    // Kategori / Alt kategori:
    //   - Müşteri Kalıbı = 'Evet' ise zorunlu değil
    //   - Diğer durumda zorunlu
    category: yup
      .string()
      .transform((_v, orig) => (orig === '' ? undefined : _v))
      .when('customerMold', {
        is: (cm: CustomerMoldSelect) => cm === 'Evet',
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required('Zorunlu'),
      }),

    subCategory: yup
      .string()
      .transform((_v, orig) => (orig === '' ? undefined : _v))
      .when('customerMold', {
        is: (cm: CustomerMoldSelect) => cm === 'Evet',
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required('Zorunlu'),
      }),

    // Yeni: boş ya da undefined gelirse otomatik "Hayır" yap
    customerMold: yup
      .mixed<CustomerMoldSelect>()
      .oneOf(['', 'Evet', 'Hayır'] as const)
      .transform((_v, orig) => (orig === '' || orig == null ? 'Hayır' : _v))
      .default('Hayır')
      .defined(),

    // Zorunlu: availability (true/false olmalı)
    availability: yup.boolean().required('Zorunlu').default(true),

    // Opsiyonel açıklama metni
    description: yup.string().default('').defined(),

    // KG/M — ondalık serbest, 0'dan büyük olmalı, zorunlu
    unitWeightG: toNullNumber()
      .required('Zorunlu')
      .moreThan(0, '0’dan büyük olmalı'),

    // Ana tarih (Zorunlu).
    date: yup.string().required('Zorunlu'),

    // Revizyon tarihi (opsiyonel)
    revisionDate: optionalIsoDateString(),

    // Düz string alanlar (boş string serbest)
    drawer: yup.string().default('').defined(),
    control: yup.string().default('').defined(),
    scale: yup.string().default('').defined(),

    // Opsiyonel sayısal alanlar
    outerSizeMm: toNullNumber().min(0, '0 veya daha büyük olmalı'),
    sectionMm2: toNullNumber().min(0, '0 veya daha büyük olmalı'),

    // Et kalınlığı (mm) — opsiyonel, girilirse 0’dan büyük olmalı
    wallThicknessMm: toNullNumber().moreThan(0, '0’dan büyük olmalı'),

    // Opsiyonel metinler
    tempCode: emptyToNull(),
    manufacturerCode: emptyToNull(),

    // URL **veya** storage path kabul et
    image: yup
      .string()
      .trim()
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
  variant: DEFAULT_VARIANT_KEY,
  category: '',
  subCategory: '',
  customerMold: 'Hayır',
  availability: true,
  description: '',

  // KG/M için başlangıçta boş bırakalım; validasyon submit’te yakalar.
  unitWeightG: 0,

  date: today(),
  revisionDate: '',
  drawer: '',
  control: '',
  scale: '',
  outerSizeMm: null,
  sectionMm2: null,
  wallThicknessMm: null,
  tempCode: null,
  manufacturerCode: null,
  image: '',
};

/** İsteğe bağlı override ile yeni default üret (date’i bugüne sabitler) */
export function makeNewProductDefaults(
  override?: Partial<ProductFormValues>,
): ProductFormValues {
  return {
    ...newProductDefaults,
    ...override,
    date: override?.date ?? today(),
  };
}

/** Select → boolean yardımcı */
export function customerMoldToBoolean(
  v: CustomerMoldSelect,
): boolean | undefined {
  if (v === '') return undefined;
  return v === 'Evet';
}

/** DB normalize: UI'daki "none" değerini veritabanında null'a çevirmek istersen kullan */
export function normalizeVariantToDb(
  v: ProductFormValues['variant'] | null | undefined,
): string {
  const raw = (v ?? '').trim();

  // Boş, null veya UI'daki DEFAULT_VARIANT_KEY ("yok") geldiyse
  // DB'de her zaman "yok" key'ini yazalım.
  if (!raw || raw === DEFAULT_VARIANT_KEY) {
    return 'yok';
  }

  return raw;
}
