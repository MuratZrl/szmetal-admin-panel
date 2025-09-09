import * as yup from 'yup';

/** Select alanlarında '' → undefined; boş seçim yakalansın */
const requiredSelect = yup
  .string()
  .transform((_v, orig) => (orig === '' ? undefined : _v))
  .required('Zorunlu');

/** Sayısal alanlar: '' ve NaN → null, min 0 */
const toNullNumber = () =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || Number.isNaN(v) ? null : v))
    .nullable()
    .min(0, '0 veya daha büyük olmalı');

/** Boş stringleri null’a çevir (opsiyonel metinler için) */
const emptyToNull = () =>
  yup
    .string()
    .optional()
    .nullable()
    .transform((v, orig) => (orig === '' ? null : v?.trim() ?? null));

/** Ortak ürün form şeması (create + edit) */
export const productSchema = yup
  .object({
    name: yup.string().required('Zorunlu'),
    code: yup.string().required('Zorunlu'),

    variant: requiredSelect,
    category: requiredSelect,
    subCategory: requiredSelect,

    // gr/m — integer normalize
    unitWeightG: toNullNumber()
      .transform(v => (typeof v === 'number' ? Math.round(v) : v))
      .required('Zorunlu')
      .min(1, 'En az 1 gr'),

    date: yup.string().required('Zorunlu'),

    // düz string alanlar (boş string serbest)
    drawer: yup.string().default('').defined(),
    control: yup.string().default('').defined(),
    scale: yup.string().default('').defined(),

    // opsiyonel sayısal alanlar
    outerSizeMm: toNullNumber(),
    sectionMm2: toNullNumber(),

    // opsiyonel metinler
    profileCode: emptyToNull(),
    tempCode: emptyToNull(),
    manufacturerCode: emptyToNull(),

    // asset public URL: boş olabilir ya da geçerli URL olmalı
    image: yup
      .string()
      .trim()
      .test('url-or-empty', 'Geçersiz URL', v => !v || /^https?:\/\/.+/i.test(v))
      .default('')
      .defined(),
  })
  .required();

export type ProductFormValues = yup.InferType<typeof productSchema>;
