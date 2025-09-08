// src/app/(admin)/create_request/[slug]/step2/page.tsx
import * as React from 'react';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Box } from '@mui/material';

import StepperComponent from '@/components/ui/stepper/Stepper';
import Step2Client from './Step2Client';

import { CREATE_REQUEST_STEPS } from '@/features/create_request/constants/steps';

import { fetchSystemFormConfig } from '@/features/create_request/services/step2RequestForm.server';

import type { FormConfig } from '@/features/create_request/types/step2Form';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cfg = await fetchSystemFormConfig(slug);
  const name = cfg.fields.length ? slug : 'Bilinmeyen Sistem';
  return { title: `Sistem Adımı 2 — ${name}` };
}

export default async function Step2Page({ params }: Props) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const formConfig: FormConfig = await fetchSystemFormConfig(slug);
  if (!formConfig.fields.length) notFound();

  const { data: draftRow, error: draftError } = await supabase
    .from('system_drafts')
    .select('form_data')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle();

  if (draftError && draftError.code !== 'PGRST116') {
    console.error('Draft fetch error:', draftError);
  }

  const initialDraft = (draftRow?.form_data as Record<string, unknown> | null) ?? null;

  return (
    <Box py={2} >
      {/* 2. adım = index 1 */}
      <Box >
        <StepperComponent activeStep={1} steps={CREATE_REQUEST_STEPS} />
      </Box>

      <Step2Client slug={slug} formConfig={formConfig} initialDraft={initialDraft} />
    </Box>
  );
}
