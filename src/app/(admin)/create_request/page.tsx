// app/(admin)/systems/page.tsx
import SystemsShell from '@/features/create_request/components/SystemsShell';
import { fetchSystems } from '@/features/create_request/services/systemCard.server';

export const revalidate = 60;

export default async function SystemsPage() {
  const systems = await fetchSystems(); // Supabase (SSR)
  return <SystemsShell initialSystems={systems} />;
}
