// src/app/(admin)/systems/[slug]/step2/page.tsx
import React from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { FormConfig } from './Step2Client';
import Step2Client from './Step2Client';
import { systemForms } from '@/features/systems/constants/systemForms';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

type Props = {
  params: { slug: string };
};

export const generateMetadata = ({ params }: Props): Metadata => ({
  title: `Sistem Adımı 2 — ${params.slug}`,
});

export default async function Step2Page({ params }: Props) {
  const slug = params.slug;
  const formConfig = systemForms[slug as keyof typeof systemForms] as FormConfig | undefined;

  // Eğer config yoksa 404 göster
  if (!formConfig) return notFound();

  // Supabase server client ile oturum ve varsa draft oku
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Eğer oturum yoksa girişe yönlendir (ya da notFound) — tercih senin
  if (!user) {
    // redirect('/auth/login'); // istersen redirect et
    return redirect('/auth/login');
  }

  // Draft tablosunda user+slug ile kaydı çek
  const { data: draftData, error: draftError } = await supabase
    .from('system_drafts')
    .select('form_data')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .single();

  // Hata logu (prod'da daha temkinli ol)
  if (draftError && draftError.code !== 'PGRST116') {
    // PGRST116 gibi 'no rows' hatası normal olabilir; burada sessizce devam ediyoruz
    console.error('Draft fetch error', draftError);
  }

  const initialDraft = draftData?.form_data ?? null;

  // Server component: Step2Client (use client) bileşenine verileri geç
  return (
    <main>
      <Step2Client formConfig={formConfig} initialDraft={initialDraft} slug={slug} />
    </main>
  );
}
