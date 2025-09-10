// src/app/(admin)/create_request/[slug]/step3/page.tsx
import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Box } from '@mui/material';
import StepperComponent from '@/components/ui/stepper/Stepper';
import Step3Client from './Step3Client';
import { CREATE_REQUEST_STEPS } from '@/features/create_request/constants/steps';
import { ensureStep } from '@/features/create_request/services/ensureStep.server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { systemStep3Configs } from '@/features/create_request/constants/systemConfigs';

export type GiyotinProfil = {
  profil_resmi: string | null;
  profil_kodu: string;
  profil_adi: string;
  birim_agirlik: number;
};

type Props = { params: Promise<{ slug: string }> };  // ← Promise

export const dynamic = 'force-dynamic';

export default async function Step3Page({ params }: Props) {
  const { slug } = await params;  // ← önce await

  const config = systemStep3Configs[slug];
  if (!config) notFound();

  // Guard
  const { draft, needsCookieSync } = await ensureStep(slug, 3);
  if (needsCookieSync) {
    redirect(`/create_request/${slug}/flow-sync?step=${draft.step}&to=step3`);
  }

  const raw = (draft.form_data ?? null) as Record<string, unknown> | null;
  const form = {
    sistem_adet: String(raw?.sistem_adet ?? ''),
    sistem_yukseklik: String(raw?.sistem_yukseklik ?? ''),
    sistem_genislik: String(raw?.sistem_genislik ?? ''),
    description: String(raw?.description ?? ''),
  };

  const supabase = await createSupabaseServerClient();
  const { data: materialRows } = await supabase
    .from('system_profiles')
    .select('profil_resmi, profil_kodu, profil_adi, birim_agirlik')
    .eq('system_slug', slug);

  const baseMaterials = (materialRows ?? []) as GiyotinProfil[];
  const computedMaterials = config.materialCalculator(form, baseMaterials);
  const computedSummary   = config.summaryCalculator(form, computedMaterials);

  return (
    <Box py={2}>
      <Box>
        <StepperComponent activeStep={2} steps={CREATE_REQUEST_STEPS} />
      </Box>

      <Step3Client
        slug={slug}
        form={form}
        summary={computedSummary}
        materials={computedMaterials}
        successRedirect="/create_request"
      />
    </Box>
  );
}
