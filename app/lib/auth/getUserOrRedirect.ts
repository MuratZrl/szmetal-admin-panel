// lib/auth/getUserOrRedirect.ts
import { redirect } from 'next/navigation'

import c

export const getUserOrRedirect = async () => {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login') // Giriş yapılmamışsa yönlendir
  }

  return user
}
