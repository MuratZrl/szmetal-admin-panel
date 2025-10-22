// app/page.tsx
import { redirect } from 'next/navigation';
import { getUserOrNull } from '@/lib/supabase/auth/server';

export default async function HomePage() {
  const user = await getUserOrNull();
  if (user) redirect('/account');
  redirect('/login');
}