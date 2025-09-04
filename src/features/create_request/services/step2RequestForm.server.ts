// src/features/create_request/services/step2RequestForm.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';
import type { FormConfig, FormField } from '@/features/create_request/types/step2Form';
import * as yup from 'yup';

type Row = Database['public']['Tables']['system_form_configs']['Row'];

const dbFieldSchema = yup.object({
  name: yup.string().required(),
  label: yup.string().required(),
  placeholder: yup.string().optional(),
  type: yup
    .mixed<'string' | 'number' | 'select' | 'text' | 'date' | 'textarea'>()
    .optional(),
  min: yup.number().optional(),
  max: yup.number().optional(),
  required: yup.boolean().optional(),
  helperText: yup.string().optional(),
}).noUnknown(true);

const dbConfigSchema = yup.object({
  fields: yup.array(dbFieldSchema).required(),
}).noUnknown(true);

function mapTypeToUi(t?: string): FormField['type'] {
  switch (t) {
    case 'number': return 'number';
    case 'date': return 'date';
    case 'textarea': return 'textarea';
    // eski dünya “string/text/select” → text’e yanaşsın
    case 'string':
    case 'text':
    case 'select':
    default: return 'text';
  }
}

function mapRow(row: Row): FormConfig {
  try {
    const parsed = dbConfigSchema.validateSync(
      { fields: row.fields },
      { abortEarly: false, stripUnknown: true }
    );
    const fields: FormField[] = parsed.fields.map(f => ({
      name: f.name,
      label: f.label,
      placeholder: f.placeholder,
      type: mapTypeToUi(f.type),
      min: f.min,
      max: f.max,
      required: f.required,
      helperText: f.helperText,
    }));
    return { fields };
  } catch {
    return { fields: [] };
  }
}

export async function fetchSystemFormConfig(slug: string): Promise<FormConfig> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('system_form_configs')
    .select('slug, fields, version, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw new Error(`form config fetch failed: ${error.message}`);
  if (!data) return { fields: [] };

  return mapRow(data as Row);
}
