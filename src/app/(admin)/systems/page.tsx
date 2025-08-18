// app/(admin)/systems/page.tsx
import SystemsShell from '@/features/systems/SystemsShell';
import type { SystemCardType } from '@/types/systems';
import { systems as initialSystems } from '@/constants/systemcards';

/**
 * Server component page — keeps the bundle small and hands the interactive bits
 * to SystemsShell (a client component).
 */
export default function SystemsPage() {
  // keep this server-side so we can later replace `initialSystems` with a DB fetch
  return <SystemsShell initialSystems={initialSystems as unknown as SystemCardType[]} />;
}
