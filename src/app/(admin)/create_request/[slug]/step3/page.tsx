// src/app/(admin)/create_request/[slug]/step3/page.tsx
import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Step3Client from './Step3Client';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { systemStep3Configs } from '@/features/create_request/constants/systemConfigs';

type Props = { params: Promise<{ slug: string }> };
export const dynamic = 'force-dynamic';

export type GiyotinProfil = {
  profil_resmi: string | null;
  profil_kodu: string;
  profil_adi: string;
  birim_agirlik: number;
};

export default async function Step3Page({ params }: Props) {
  const { slug } = await params;

  const config = systemStep3Configs[slug];
  if (!config) return notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/auth/login');

  const { data: draftRow } = await supabase
    .from('system_drafts')
    .select('form_data')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle();

  const raw = (draftRow?.form_data ?? null) as Record<string, unknown> | null;
  const form = {
    sistem_adet: String(raw?.sistem_adet ?? ''),
    sistem_yukseklik: String(raw?.sistem_yukseklik ?? ''),
    sistem_genislik: String(raw?.sistem_genislik ?? ''),
    description: String(raw?.description ?? ''),
  };

  // ←← DOĞRU TİPLİ SORGU (A yolu: tipler güncelse aşağıdaki satırı kullan)
  const { data: materialRows, error: materialError } = await supabase
    .from('system_profiles')
    .select('profil_resmi, profil_kodu, profil_adi, birim_agirlik')
    .eq('system_slug', slug);

  if (materialError) console.error('Material fetch error', materialError);

  const baseMaterials = (materialRows ?? []) as GiyotinProfil[];
  const computedMaterials = config.materialCalculator(form, baseMaterials);
  const computedSummary   = config.summaryCalculator(form, computedMaterials);

  return (
    <main>
      <Step3Client
        slug={slug}
        form={form}
        summary={computedSummary}
        materials={computedMaterials}
        successRedirect="/create_request"
      />
    </main>
  );
}
