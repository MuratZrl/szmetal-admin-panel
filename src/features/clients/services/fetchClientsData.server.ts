// src/features/clients/services/fetchClientsData.server.ts
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import type { ClientUser, ClientsPageData, UsersTotals } from "../types";
import { cookies } from "next/headers";

export async function fetchClientsData(): Promise<ClientsPageData> {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: n => cookieStore.get(n)?.value } }
  );

  // Seçtiğin kolonlara uygun tip bildirimi
  const { data: usersRaw } = await supabase
    .from("users")
    .select("id, image, email, username, company, country, role, phone, status, created_at")
    .order("created_at", { ascending: false })
    .returns<ClientUser[]>(); // ← as değil, returns

  const users = usersRaw ?? [];

  // Totaller (örnek)
  const total = users.length;
  const active = users.filter(u => u.status === "active").length;
  const inactive = users.filter(u => u.status === "inactive").length;

  const now = new Date();
  const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLast = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonth = users.filter(u => new Date(u.created_at) >= startThis).length;
  const lastMonth = users.filter(u => {
    const d = new Date(u.created_at);
    return d >= startLast && d <= endLast;
  }).length;

  const changePct = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  const totals: UsersTotals = { total, active, inactive, thisMonth, lastMonth, changePct };
  return { users, totals };
}
