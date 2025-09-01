// src/features/account/services/getAccountData.server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import type { UserData } from "@/features/account/hooks/useAccount";

export async function getAccountData() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as UserData | null };

  // DİKKAT: 'image' kolonunu seçiyoruz. 'avatar_url' yok.
  const { data, error } = await supabase
    .from("users")
    .select("image, username, email, role, phone, company, country")
    .eq("id", user.id)
    .single();

  if (error) {
    // Profil alınamadıysa null döndür.
    return { user, profile: null as UserData | null };
  }

  // Supabase tipleri union’ı büyütmesin diye açıkça UserData’a map’liyoruz.
  const profile: UserData = {
    image: data.image,
    username: data.username,
    email: data.email,
    role: data.role,
    phone: data.phone,
    company: data.company,
    country: data.country,
  };

  return { user, profile };
}
