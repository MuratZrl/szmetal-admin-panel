// _constants_/schemas/passwordSchema.ts
import * as yup from 'yup';

export const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Mevcut şifre zorunlu'),

  newPassword: yup
    .string()
    .min(6, 'Yeni şifre en az 6 karakter olmalı')
    .required('Yeni şifre zorunlu'),
});
