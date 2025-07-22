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
    .optional()
    .nullable()
    .transform((value, originalValue) => originalValue.trim() === '' ? null : value),
});