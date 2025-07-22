import * as yup from 'yup';

export const productDialogSchema = yup.object({
  profil_kodu: yup
    .string()
    .required('Profil kodu zorunludur')
    .min(2, 'En az 2 karakter olmalı'),

  profil_adi: yup
    .string()
    .required('Profil adı zorunludur')
    .min(3, 'En az 3 karakter olmalı'),

  profil_resmi: yup
    .string()
    .url('Geçerli bir URL girin')
    .required('Profil resmi zorunludur'),

  birim_agirlik: yup
    .number()
    .typeError('Birim ağırlık sayı olmalıdır')
    .positive('Sıfırdan büyük olmalıdır')
    
    .test('decimal-precision', 'En fazla 3 ondalık basamak girilebilir', (value) =>
      /^\d+(\.\d{1,3})?$/.test(String(value))
    )

    .test('no-leading-zero', 'Başında sıfır olamaz (örn: 01 değil, 1 yazın)', (value) =>
      value === undefined || !/^0\d+/.test(String(value))
    )

    .required('Birim ağırlık zorunludur'),
});
