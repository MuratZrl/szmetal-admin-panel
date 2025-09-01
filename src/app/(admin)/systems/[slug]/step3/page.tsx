// src/app/(admin)/systems/[slug]/step3/page.tsx
import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Step3Client from './Step3Client';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { systemStep3Configs } from '@/features/systems/constants/systemConfigs';
import type { GridColDef } from '@mui/x-data-grid';

type Props = {
  params: { slug: string };
};

export default async function Step3Page({ params }: Props) {
  const slug = params.slug;
  const config = systemStep3Configs[slug];

  if (!config) return notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/login');
  }

  // 1) Kullanıcıya ait draft'ı oku
  const { data: draftRow } = await supabase
    .from('system_drafts')
    .select('form_data')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .single();

  const form = draftRow?.form_data ?? null;

  // 2) Malzeme verisini server'da çek
  const { data: materialRows, error: materialError } = await supabase
    .from(config.supabaseTable)
    .select('*')
    .eq(config.supabaseFilterColumn, slug);

  if (materialError) {
    // Hata logu; istersen user'a gösterilecek bir fallback de sağlayabilirsin
    console.error('Material fetch error', materialError);
  }

  // 3) Sunucu tarafında summary hesapla (config.summaryCalculator sync veya async olabilir)
  // Eğer async ise await kullan; burada sync olduğu varsayılıyor:
  const computedSummary = config.summaryCalculator(form, materialRows ?? []);

  // 4) Kolon tanımlarını (GridColDef[]) server-side olarak al — Step3Client bunları tipli alacak
  const summaryColumns: GridColDef[] = config.summaryColumns;
  const materialColumns: GridColDef[] = config.materialColumns;

  return (
    <section>
      <Step3Client
        slug={slug}
        form={form}
        summary={computedSummary}
        materials={materialRows ?? []}
        summaryColumns={summaryColumns}
        materialColumns={materialColumns}
      />
    </section>
  );
}
