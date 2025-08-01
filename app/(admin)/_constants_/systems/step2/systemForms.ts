// app/_constants_/systems/step2/systemForms.ts

export type FormFieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
  helperText?: string;
};

export type SystemFormConfig = {
  fields: FormFieldConfig[];
};

export const systemForms: Record<string, SystemFormConfig> = {
  'giyotin-sistemi': {
    fields: [
      {
        name: 'description',
        label: 'Proje Adı',
        type: 'string',
        min: 1,
        required: true,
        helperText: 'Proje adını giriniz.',
      },
      {
        name: 'sistem_adet',
        label: 'Sistem Adedi',
        placeholder: 'Örn: 2',
        type: 'number',
        min: 1,
        required: true,
        helperText: 'Pozitif bir değer giriniz.',
      },
      {
        name: 'sistem_yukseklik',
        label: 'Sistem Yüksekliği (mm)',
        type: 'number',
        min: 1500,
        max: 4000,
        required: true,
        helperText: '1500 - 4000 mm arası olmalı.',
      },
      {
        name: 'sistem_genislik',
        label: 'Sistem Genişliği (mm)',
        type: 'number',
        min: 1500,
        max: 4000,
        required: true,
        helperText: '1500 - 4000 mm arası olmalı.',
      },
    ],
  },

  // İleride başka sistemler...
};
