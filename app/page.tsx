// app/page.tsx

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './lib/supabase/supabaseServer'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/systems')
  } else {
    redirect('/login')
  }
}
