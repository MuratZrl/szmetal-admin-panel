import * as yup from 'yup';

export const accountSchema = yup.object({
  username: yup
    .string()
    .min(3, 'En az 3 karakter olmalıdır.')
    .required('Kullanıcı adı zorunlu'),

  phone: yup
    .string()
    .optional()
    .nullable()
    .matches(/^0\d{10}$/, 'Telefon numarası 0 ile başlamalı ve 11 hane olmalıdır.')
    .transform((value, originalValue) => originalValue.trim() === '' ? null : value),

  company: yup
  .string()
  .transform((value, originalValue) => {
    if (typeof originalValue === 'string') {
      const trimmed = originalValue.trim();
      return trimmed === '' ? null : trimmed;
    }
    return value;
  })
  .nullable()
  .notRequired()
  .test(
    'min-or-empty',
    'Şirket adı en az 3 karakter olmalıdır.',
    (val) => {
      // val === null => boş bırakılmış, geçerli
      // aksi halde length >= 3 olmalı
      return val == null || (typeof val === 'string' && val.length >= 3);
    }
  ),

  country: yup
    .string()
    .optional()
    .nullable()
    .transform((value, originalValue) =>
      originalValue?.trim() === '' ? null : value
    ),
});