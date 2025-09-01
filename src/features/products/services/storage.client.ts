// src/features/products/services/storage.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';

const BUCKET = 'product-media';

export async function uploadProductPdfAndGetUrl(codeOrFallback: string, file: File): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('Sadece PDF yükleyin.');
  }
  const base = codeOrFallback || `product-${Date.now()}`;
  const fileName = `${Date.now()}-${crypto.randomUUID()}.pdf`;
  const path = `pdf/${base}/${fileName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: 'application/pdf',
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
