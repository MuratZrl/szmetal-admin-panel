// app/(admin)/clients/page.tsx
import ClientsPageSection from "@/features/clients/components/ClientsPageSection.client";
import { fetchClientsData } from "@/features/clients/services/fetchClientsData.server";
// Giriş zorunluysa redirect kullanabilirsin:
// import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // veriler sık değişiyorsa iyi seçim
export const revalidate = 60;

export default async function ClientsPage() {
  // Sunucuda veriyi toparla
  const { users, totals } = await fetchClientsData();

  // Eğer fetchClientsData içinde oturum kontrolü yapıyorsan ve user yoksa burada redirect edebilirsin:
  // if (!user) redirect("/login?redirectedFrom=%2Fclients");

  // Etkileşimli kısım client adacığına gitsin
  return <ClientsPageSection initialUsers={users} initialTotals={totals} />;
}
