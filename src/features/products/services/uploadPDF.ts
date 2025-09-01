// src/features/products/services/uploadPdf.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';

export async function uploadProductPdf(file: File, key: string) {
  // key: id, code veya slug. Dosya adı için uniq yapıyoruz.
  const ext = 'pdf';
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const path = `pdf/${key}/${fileName}`;

  const { error: upErr } = await supabase
    .storage
    .from('product-media')
    .upload(path, file, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: true,
    });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from('product-media').getPublicUrl(path);
  return { url: data.publicUrl, path, ext: 'pdf' as const };
}
