// app/(admin)/create_request/[slug]/step1/page.tsx
import { redirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function Step1RedirectPage({ params }: Props) {
  const { slug } = await params;         // ← Promise'i çöz
  redirect(`/create_request/${slug}/step2`);
}
