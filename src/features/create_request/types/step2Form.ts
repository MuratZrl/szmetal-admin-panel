// src/features/create_request/types/step2Form.ts
export type FieldType = 'text' | 'number' | 'textarea' | 'date';

export type FormField = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  helperText?: string;
};

export type FormConfig = {
  fields: FormField[];
};

export type DraftData = Record<string, string>;
