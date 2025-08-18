// lib/auth/getUserOrRedirect.ts
import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '../supabase/supabaseServer'

export const getUserOrRedirect = async () => {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login') // Giriş yapılmamışsa yönlendir
  }

  return user
}
