// app/(admin)/create_request/[slug]/step2/page.tsx
import * as React from 'react';
import { redirect, notFound } from 'next/navigation';
import { Box } from '@mui/material';
import StepperComponent from '@/components/ui/stepper/Stepper';
import Step2Client from './Step2Client';
import { CREATE_REQUEST_STEPS } from '@/features/create_request/constants/steps';
import { fetchSystemFormConfig } from '@/features/create_request/services/step2RequestForm.server';
import type { FormConfig } from '@/features/create_request/types/step2Form';
import { ensureStep } from '@/features/create_request/services/ensureStep.server';

type Params = { slug: string };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const cfg = await fetchSystemFormConfig(slug);
  const name = cfg.fields.length ? slug : 'Bilinmeyen Sistem';
  return { title: `Sistem Adımı 2 — ${name}` };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  const { draft, needsCookieSync } = await ensureStep(slug, 2);
  if (needsCookieSync) {
    redirect(`/create_request/${slug}/flow-sync?step=${draft.step}&to=step2`);
  }

  const formConfig: FormConfig = await fetchSystemFormConfig(slug);
  if (formConfig.fields.length === 0) {
    notFound();
  }

  const initialDraft = (draft.form_data as Record<string, unknown> | null) ?? null;

  return (
    <Box py={2}>
      <Box>
        <StepperComponent activeStep={1} steps={CREATE_REQUEST_STEPS} />
      </Box>
      <Step2Client slug={slug} formConfig={formConfig} initialDraft={initialDraft} />
    </Box>
  );
}
