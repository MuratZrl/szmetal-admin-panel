// categoryProductSchemas.ts
import * as yup from 'yup';
import type { InferType } from 'yup';

/**
 * Helper: boş string -> null; trim yap
 */
const nullableString = () =>
  yup
    .string()
    .trim()
    .nullable()
    .transform((value, original) => (original === '' ? null : value));

/**
 * Tarih için YYYY-MM-DD basit regex doğrulaması.
 * (Tarayıcı date input'ı kullanıyorsan string olarak gelmesi normal.)
 */
const dateString = () =>
  nullableString().matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Tarih formatı YYYY-MM-DD olmalı',
    excludeEmptyString: true,
  });

/**
 * Kod / kısa alanlar için örnek şema (maks uzunluk kontrolü)
 */
const codeString = (max = 64) => nullableString().max(max, `En fazla ${max} karakter olabilir`);

/**
 * Numeric field (ör. birim ağırlık)
 * boş string -> null, else number. NaN ise typeError atar.
 */
const nullableNumber = () =>
  yup
    .number()
    .nullable()
    .transform((value, original) => {
      if (original === '' || original === null || typeof original === 'undefined') return null;
      const n = Number(original);
      return Number.isNaN(n) ? NaN : n;
    })
    .typeError('Sayı olmalıdır')
    .min(0, 'Negatif olamaz');

/**
 * Field-level şemalar (isteğe göre tek tek import edip kullanabilirsin)
 */
export const fieldSchemas = {
  drawer: nullableString(),
  controller: nullableString(),
  date: dateString(),
  revision: nullableString(),
  scale: nullableString(),
  outer_env: nullableString(),
  section: nullableString(),
  unit_weight: nullableNumber(),
  name: nullableString(),
  customer: nullableString(),
  customer_approval_date: dateString(),
  temp_code: codeString(32),
  profile_code: codeString(64),
  manufacturer_code: codeString(64),
} as const;

/**
 * Tüm formun birleşik yup şeması
 */
export const productFormSchema = yup.object({
  drawer: fieldSchemas.drawer,
  controller: fieldSchemas.controller,
  date: fieldSchemas.date,
  revision: fieldSchemas.revision,
  scale: fieldSchemas.scale,
  outer_env: fieldSchemas.outer_env,
  section: fieldSchemas.section,
  unit_weight: fieldSchemas.unit_weight,
  name: fieldSchemas.name.required('İsim zorunludur'),
  customer: fieldSchemas.customer,
  customer_approval_date: fieldSchemas.customer_approval_date,
  temp_code: fieldSchemas.temp_code,
  profile_code: fieldSchemas.profile_code,
  manufacturer_code: fieldSchemas.manufacturer_code,
});

/**
 * Tip çıkarımı (TypeScript ile tam uyumlu)
 */
export type ProductFormValues = InferType<typeof productFormSchema>;

/**
 * Varsayılan değerler (react-hook-form defaultValues olarak kullan)
 * Tip uyumluluğu sebebiyle burada alanlar null veya uygun tipte.
 */
export const defaultProductFormValues: ProductFormValues = {
  drawer: null,
  controller: null,
  date: null,
  revision: null,
  scale: null,
  outer_env: null,
  section: null,
  unit_weight: null,
  name: 'null',
  customer: null,
  customer_approval_date: null,
  temp_code: null,
  profile_code: null,
  manufacturer_code: null,
};

export default productFormSchema;
